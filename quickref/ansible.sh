#!/bin/bash

# 安装 Ansible
install_ansible() {
    # 函数用于在不同系统上安装 Ansible
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ansible
    elif [[ -f /etc/redhat-release ]]; then
        yum install -y ansible
    else
        pip install ansible
    fi
}

# 配置 Ansible
configure_ansible() {
    # 函数用于显示 Ansible 配置文件的位置
    echo "Ansible 配置文件位置:"
    echo "/etc/ansible/ansible.cfg - 系统范围的配置"
    echo "~/ansible.cfg - 用户特定的配置"
    echo "\$pwd/ansible.cfg - 当前目录下的配置"
}

# 创建静态 Inventory 文件
create_static_inventory() {
    # 函数用于创建一个基本的静态 Inventory 文件
    cat << EOF > /etc/ansible/hosts
mail.example.com

[webservers]
foo.example.com
bar.example.com
EOF
    echo "静态 Inventory 文件已创建在 /etc/ansible/hosts"
}

# 创建高级 Inventory 文件
create_advanced_inventory() {
    # 函数用于创建一个更复杂的 Inventory 文件，包括 IP 范围和域名模式
    cat << EOF > advanced_inventory
[web]
172.18.12.5[1:4]

[webservers]
www[01:50].example.com

[usa:children]
southeast
northeast
southwest
northwest
EOF
    echo "高级 Inventory 文件已创建：advanced_inventory"
}

# 设置组变量
set_group_variables() {
    # 函数用于为主机组设置变量
    cat << EOF > group_vars
[atlanta]
host1
host2

[atlanta:vars]
ntp_server=ntp.atlanta.example.com
proxy=proxy.atlanta.example.com
EOF
    echo "组变量文件已创建：group_vars"
}

# 运行常用的 Ansible 命令
run_ansible_commands() {
    # 函数用于展示一些常用的 Ansible 命令
    echo "检查 Inventory 是否生效:"
    ansible all --list-hosts

    echo "Ping 所有目标:"
    ansible all -m ping

    echo "在本地执行命令:"
    ansible all -i localhost, -e '{"ansible_connection": "local"}' -a 'hostname'

    echo "获取本地主机信息:"
    ansible all -i localhost, -e '{"ansible_connection": "local"}' -m setup

    echo "在所有目标上执行命令:"
    ansible all -a "uptime"

    echo "使用 shell 模块执行复杂命令:"
    ansible all -m shell -a "ps aux | grep nginx"

    echo "安装软件包:"
    ansible all -m yum -a "name=nginx state=present"

    echo "管理服务状态:"
    ansible all -m service -a "name=nginx state=started"

    echo "收集系统信息:"
    ansible all -m setup

    echo "使用 playbook 执行任务:"
    ansible-playbook sample-playbook.yml

}

# 文件操作命令
file_operations() {
    # 函数用于展示 Ansible 的文件操作命令
    echo "从远程获取文件到本地:"
    ansible target -m fetch -a "src=/tmp/seq dest=/tmp/seq"

    echo "从本地复制文件到远程:"
    ansible target -m copy -a "src=/tmp/seq dest=/tmp/seq"
}

# 主函数
main() {
    echo "Ansible 快速参考脚本"
    echo "1. 安装 Ansible"
    echo "2. 配置 Ansible"
    echo "3. 创建静态 Inventory"
    echo "4. 创建高级 Inventory"
    echo "5. 设置组变量"
    echo "6. 运行常用 Ansible 命令"
    echo "7. 文件操作命令"
    echo "8. Playbook 全量示例"
    echo "请选择一个选项 (1-8):"
    read choice

    case $choice in
        1) install_ansible ;;
        2) configure_ansible ;;
        3) create_static_inventory ;;
        4) create_advanced_inventory ;;
        5) set_group_variables ;;
        6) run_ansible_commands ;;
        7) file_operations ;;
        8) create_full_playbook_example ;;
        *) echo "无效选项" ;;
    esac
}

create_full_playbook_example() {
    cat << EOF > full_playbook_example.yml
---
- name: 完整的 Playbook 示例
  hosts: webservers
  vars:
    http_port: 80
    max_clients: 200
  remote_user: root
  
  tasks:
    - name: 确保 apache 已安装
      yum:
        name: httpd
        state: present

    - name: 确保 apache 正在运行
      service:
        name: httpd
        state: started

    - name: 写入 apache 配置文件
      template:
        src: /srv/httpd.j2
        dest: /etc/httpd.conf
      notify:
      - 重启 apache

    - name: 确保 apache 在开机时启动
      service:
        name: httpd
        enabled: yes

  handlers:
    - name: 重启 apache
      service:
        name: httpd
        state: restarted
EOF
    echo "完整的 Playbook 示例已创建：full_playbook_example.yml"
}

main
