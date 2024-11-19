#!/bin/bash

# FFmpeg 实用工具函数

# 安装 FFmpeg
install_ffmpeg() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install ffmpeg || sudo yum install ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    else
        echo "不支持自动安装的操作系统"
    fi
}

# 将 MP4 转换为 AVI
mp4_to_avi() {
    ffmpeg -i "$1" "${1%.*}.avi"
}

# 将 WebM 转换为 MP4
webm_to_mp4() {
    ffmpeg -i "$1" "${1%.*}.mp4"
}

# 剪切视频
cut_video() {
    ffmpeg -i "$1" -ss "$2" -t "$3" -vcodec copy -acodec copy "$4"
}

# 更改帧率
change_frame_rate() {
    ffmpeg -i "$1" -r "$2" "$3"
}

# 提取音频
extract_audio() {
    ffmpeg -i "$1" -vn -acodec libmp3lame -q:a 2 "$2"
}

# 提取视频
extract_video() {
    ffmpeg -i "$1" -an -c copy "${1%.*}_video.mp4"
}

# 调整视频大小
resize_video() {
    ffmpeg -i "$1" -vf "scale=$2:$3" "$4"
}

# 添加字幕
add_subtitle() {
    ffmpeg -i "$1" -vf "subtitles=$2" -codec:a copy "$3"
}

# 合并视频
merge_videos() {
    echo "file '$1'" > mylist.txt
    echo "file '$2'" >> mylist.txt
    ffmpeg -f concat -safe 0 -i mylist.txt -c copy "$3"
    rm mylist.txt
}

# 添加水印
add_watermark() {
    ffmpeg -i "$1" -i "$2" -filter_complex "overlay=10:10" "$3"
}

# 旋转视频
rotate_video() {
    ffmpeg -i "$1" -vf "rotate=$2*PI/180" "$3"
}

# 更改视频速度
change_video_speed() {
    ffmpeg -i "$1" -vf "setpts=$2*PTS" "$3"
}

# 调整音频音量
adjust_audio_volume() {
    ffmpeg -i "$1" -af "volume=$2" "$3"
}

# 裁剪视频
trim_video() {
    ffmpeg -i "$1" -ss "$2" -to "$3" -c copy "$4"
}

# 从图像创建视频
create_video_from_images() {
    ffmpeg -framerate "$1" -pattern_type glob -i "$2" -c:v libx264 -pix_fmt yuv420p "$3"
}

# 视频压缩
compress_video() {
    ffmpeg -i "$1" -vcodec libx264 -crf 23 "$2"
}

# 视频降噪
denoise_video() {
    ffmpeg -i "$1" -vf "nlmeans" "$2"
}

# 视频稳定
stabilize_video() {
    ffmpeg -i "$1" -vf deshake "$2"
}

# 增大音量
increase_volume() {
    ffmpeg -i "$1" -af "volume=1.5" "$2"
}

# 更改音频速度
change_audio_speed() {
    ffmpeg -i "$1" -af "atempo=$2" "$3"
}

# 统一视频的音量
normalize_audio() {
    ffmpeg -i "$1" -af "loudnorm=I=-5:LRA=1" "$2"
}

# 重新映射通道数
remap_channels() {
    ffmpeg -i "$1" -af "channelmap=1-0|1-1" "$2"
}

# 拉取流
pull_stream() {
    ffmpeg -i "$1" "$2"
}

# 推送流
push_stream() {
    ffmpeg -re -i "$1" -f flv "$2"
}

# 转发流
forward_stream() {
    ffmpeg -i "$1" -f mpegts -codec:v mpeg1video "$2"
}

# 使用示例
usage() {
    echo "推拉流使用示例:"
    echo "22. 重新映射通道数: ./ffmpeg_utils.sh remap_channels input.mp4 output.mp4"
    echo "23. 拉取流: ./ffmpeg_utils.sh pull_stream rtmp://example.com/live/stream output.mp4"
    echo "24. 推送流: ./ffmpeg_utils.sh push_stream input.mp4 rtmp://example.com/live/stream"
    echo "25. 转发流: ./ffmpeg_utils.sh forward_stream rtmp://source.com/live/stream udp://destination.com:1234"
}


# 主函数
main() {
    echo "FFmpeg 实用工具脚本"
    echo "1. 安装 FFmpeg"
    echo "2. 将 MP4 转换为 AVI"
    echo "3. 将 WebM 转换为 MP4"
    echo "4. 剪切视频"
    echo "5. 更改帧率"
    echo "6. 提取音频"
    echo "7. 提取视频"
    echo "8. 调整视频大小"
    echo "9. 添加字幕"
    echo "10. 合并视频"
    echo "11. 添加水印"
    echo "12. 旋转视频"
    echo "13. 更改视频速度"
    echo "14. 调整音频音量"
    echo "15. 裁剪视频"
    echo "16. 从图像创建视频"
    echo "17. 视频压缩"
    echo "18. 视频降噪"
    echo "19. 视频稳定"
    echo "20. 增大音量"
    echo "21. 更改音频速度"
    echo "22. 统一视频的音量"
    echo "23. 重新映射通道数"
    echo "24. 拉取流"
    echo "25. 推送流"
    echo "26. 转发流"
    usage
    echo "请选择一个选项 (1-26)："
    read choice

    case $choice in
        1) install_ffmpeg ;;
        2) read -p "输入 MP4 文件：" input_file; mp4_to_avi "$input_file" ;;
        3) read -p "输入 WebM 文件：" input_file; webm_to_mp4 "$input_file" ;;
        4) read -p "输入文件：" input_file
           read -p "开始时间 (HH:MM:SS)：" start_time
           read -p "持续时间 (HH:MM:SS)：" duration
           read -p "输出文件：" output_file
           cut_video "$input_file" "$start_time" "$duration" "$output_file" ;;
        5) read -p "输入文件：" input_file
           read -p "新帧率：" frame_rate
           read -p "输出文件：" output_file
           change_frame_rate "$input_file" "$frame_rate" "$output_file" ;;
        6) read -p "输入文件：" input_file
           read -p "输出文件：" output_file
           extract_audio "$input_file" "$output_file" ;;
        7) read -p "输入文件：" input_file; extract_video "$input_file" ;;
        8) read -p "输入文件：" input_file
           read -p "新宽度：" width
           read -p "新高度：" height
           read -p "输出文件：" output_file
           resize_video "$input_file" "$width" "$height" "$output_file" ;;
        9) read -p "输入视频文件：" input_file
           read -p "字幕文件：" subtitle_file
           read -p "输出文件：" output_file
           add_subtitle "$input_file" "$subtitle_file" "$output_file" ;;
        10) read -p "第一个视频文件：" video1
            read -p "第二个视频文件：" video2
            read -p "输出文件：" output_file
            merge_videos "$video1" "$video2" "$output_file" ;;
        11) read -p "输入视频文件：" input_file
            read -p "水印图片文件：" watermark_file
            read -p "输出文件：" output_file
            add_watermark "$input_file" "$watermark_file" "$output_file" ;;
        12) read -p "输入文件：" input_file
            read -p "旋转角度（度）：" angle
            read -p "输出文件：" output_file
            rotate_video "$input_file" "$angle" "$output_file" ;;
        13) read -p "输入文件：" input_file
            read -p "速度因子（0.5 为半速，2 为双倍速）：" speed
            read -p "输出文件：" output_file
            change_video_speed "$input_file" "$speed" "$output_file" ;;
        14) read -p "输入文件：" input_file
            read -p "音量因子（0.5 为半音量，2 为双倍音量）：" volume
            read -p "输出文件：" output_file
            adjust_audio_volume "$input_file" "$volume" "$output_file" ;;
        15) read -p "输入文件：" input_file
            read -p "开始时间 (HH:MM:SS)：" start_time
            read -p "结束时间 (HH:MM:SS)：" end_time
            read -p "输出文件：" output_file
            trim_video "$input_file" "$start_time" "$end_time" "$output_file" ;;
        16) read -p "帧率：" frame_rate
            read -p "输入模式（例如，'img*.jpg'）：" input_pattern
            read -p "输出文件：" output_file
            create_video_from_images "$frame_rate" "$input_pattern" "$output_file" ;;
        17) read -p "输入文件：" input_file
            read -p "输出文件：" output_file
            compress_video "$input_file" "$output_file" ;;
        18) read -p "输入文件：" input_file
            read -p "输出文件：" output_file
            denoise_video "$input_file" "$output_file" ;;
        19) read -p "输入文件：" input_file
            read -p "输出文件：" output_file
            stabilize_video "$input_file" "$output_file" ;;
        20) read -p "输入文件：" input_file
            read -p "输出文件：" output_file
            increase_volume "$input_file" "$output_file" ;;
        21) read -p "输入文件：" input_file
            read -p "速度因子（0.5 为半速，2 为双倍速）：" speed
            read -p "输出文件：" output_file
            change_audio_speed "$input_file" "$speed" "$output_file" ;;
        22) read -p "输入文件：" input_file
            read -p "输出文件：" output_file
            normalize_audio "$input_file" "$output_file" ;;
        23) read -p "输入文件：" input_file
            read -p "输出文件：" output_file
            remap_channels "$input_file" "$output_file" ;;
        24) read -p "输入流地址：" input_stream
            read -p "输出文件：" output_file
            pull_stream "$input_stream" "$output_file" ;;
        25) read -p "输入文件：" input_file
            read -p "输出流地址：" output_stream
            push_stream "$input_file" "$output_stream" ;;
        26) read -p "输入流地址：" input_stream
            read -p "输出流地址：" output_stream
            forward_stream "$input_stream" "$output_stream" ;;
        *) echo "无效选项" ;;
    esac
}

# 运行主函数
main
