#!/bin/bash

LOG_FILE="$(dirname "$0")/txhj.log"
mycollect=''
edgecollect=''

log() {
    echo "$1" | tee -a "$LOG_FILE"
}

get_latest_logs() {
    edgecollect=$(docker ps --format '{{.Names}}' | grep '^pai' | sort -V | while read container; do
        mac=$(docker inspect -f '{{range .Config.Env}}{{if eq (index (split . "=") 0) "MAC_ADDRESS"}}{{index (split . "=") 1}}{{end}}{{end}}' $container)
        if [ -n "$mac" ]; then
            latest_log=$(grep "$mac" /ipaas/airship/tools/argus/logs/output/output_tencent_traffic/plugin.log | tail -n 1)
            if [ -n "$latest_log" ]; then
                timestamp=$(echo "$latest_log" | awk -F'[][]' '{print $2}')
                data=$(echo "$latest_log" | awk -F'send data ' '{print $2}' | cut -d',' -f7-18)
                echo "$container+$mac+$data"
            fi
        fi
    done)
    for i in ${edgecollect[@]}; do log "$i"; done
}

get_traffic() {
    local container_id=$1
    local mode=$2
    local max_retries=3
    local retry_count=0
    
    if [ "$mode" = "cgroup" ]; then
        local classid=$(cat /sys/fs/cgroup/net_cls,net_prio/system.slice/docker-${container_id}.scope/net_cls.classid 2>/dev/null)
        if [ -n "$classid" ]; then
            while [ $retry_count -lt $max_retries ]; do
                traffic=$(iptables -nxvL PAI_OUTPUT_CGROUP | grep $classid | awk '{print $2}')
                if [ $? -eq 0 ] && [ -n "$traffic" ]; then
                    echo "$traffic"
                    return 0
                fi
                retry_count=$((retry_count + 1))
                if [ $retry_count -lt $max_retries ]; then
                    log "iptables命令失败，2秒后进行第$((retry_count + 1))次重试..."
                    sleep 2
                fi
            done
        fi
    else
        local pai_device=$(docker inspect -f '{{range .Config.Env}}{{if eq (index (split . "=") 0) "PAI_DEVICES"}}{{index (split . "=") 1}}{{end}}{{end}}' "$container_id")
        if [ -n "$pai_device" ]; then
            while [ $retry_count -lt $max_retries ]; do
                traffic=$(iptables -nxvL PAI_OUTPUT_MACHINE | grep -w "$pai_device" | awk '{print $2}')
                if [ $? -eq 0 ] && [ -n "$traffic" ]; then
                    echo "$traffic"
                    return 0
                fi
                retry_count=$((retry_count + 1))
                if [ $retry_count -lt $max_retries ]; then
                    log "iptables命令失败，2秒后进行第$((retry_count + 1))次重试..."
                    sleep 2
                fi
            done
        fi
    fi
    echo "N/A"
}

display_menu() {
    log "该脚本通过iptables获取容器的cgroup或machine模式的网络流量"
    log "Select a container to monitor:"
    docker ps --format "{{.Names}}" | nl -w2 -s') ' | tee -a "$LOG_FILE"
    log "0) Exit"
}

display_interval_menu() {
    log "请选择监控间隔:"
    log "1) 1分钟"
    log "2) 5分钟"
    log "0) 返回上级菜单"
}

display_mode_menu() {
    log "请选择监控模式:"
    log "1) cgroup模式 (使用net_cls.classid)"
    log "2) machine模式 (使用PAI_DEVICES)"
    log "0) 退出"
}

monitor_traffic() {
    local container_id=$1
    local container_name=$2
    local interval_choice=$3
    local mode=$4
    
    local interval
    case $interval_choice in
        1) interval=1 ;;
        2) interval=5 ;;
    esac
    
    local sleep_time=$((interval * 60))
    
    log "Monitoring traffic for container: $container_name"
    log "------------------------------"
    
    if [ "$mode" = "cgroup" ]; then
        local classid=$(cat /sys/fs/cgroup/net_cls,net_prio/system.slice/docker-${container_id}.scope/net_cls.classid 2>/dev/null)
        log "开始监控 (cgroup模式)----从下面开始真正复制日志分析"
        log "${container_name} ${container_id} ${interval}min classid: ${classid}"
    else
        local pai_device=$(docker inspect -f '{{range .Config.Env}}{{if eq (index (split . "=") 0) "PAI_DEVICES"}}{{index (split . "=") 1}}{{end}}{{end}}' "$container_id")
        log "开始监控 (machine模式)----从下面开始真正复制日志分析"
        log "${container_name} ${container_id} ${interval}min PAI_DEVICES: ${pai_device}"
    fi
    
    while true; do
        current_time=$(date +"%Y-%m-%d %H:%M:%S")
        current_second=$(date +%-S)
        if [ "$interval" -eq 1 ]; then
            [ "$current_second" -eq 0 ] && break
        else
            current_minute=$(date +%-M)
            [[ $((current_minute % 5)) -eq 0 && "$current_second" -eq 0 ]] && break
        fi
        echo -ne "\rWaiting for next interval... Current time: $current_time" | tee -a "$LOG_FILE"
        sleep 1
    done
    log ""

    start_time=$(date +%s)
    while true; do
        current_time=$(date +%s)
        elapsed_time=$((current_time - start_time))
        
        if [ $elapsed_time -ge 3600 ]; then
            log "监控已运行1小时，自动退出"
            get_latest_logs
            exit 0
        fi
        
        traffic_before=$(get_traffic $container_id $mode)
        sleep $sleep_time
        traffic_after=$(get_traffic $container_id $mode)
        
        traffic_diff=$((traffic_after - traffic_before))
        traffic_diff_bits=$((traffic_diff))
        current_time=$(date +"%Y-%m-%d %H:%M:%S")
        ago_time=$(date -d "$interval minutes ago" +"%Y-%m-%d %H:%M:%S")
        log "[$ago_time - $current_time] Traffic (bits/${interval}min): $traffic_diff_bits"
        mycollect="${mycollect}${current_time}:${traffic_diff_bits}+"
    done
}

mode="machine"
choice=2  # 默认为2，表示选择第2个容器
interval_choice=2  # 默认为5分钟

container_name=$(docker ps --format "{{.Names}}" | sed -n "${choice}p")
if [ -z "$container_name" ]; then
    log "Invalid choice. Exiting..."
    exit 1
fi
container_id=$(docker inspect -f '{{.Id}}' "$container_name")
log "$container_id $container_name $interval_choice $mode"
monitor_traffic "$container_id" "$container_name" "$interval_choice" "$mode"
