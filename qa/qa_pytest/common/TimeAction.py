#!/usr/bin/env python
# -*- coding: UTF-8 -*-
"""
@Time: 2021/8/30 5:35 下午
@File:  TimeAction.py
@Author:  zhangzhen_zhuqing
@Contact:  zhuqing@pplabs.org
@License: Mulan PSL
"""
import time
import datetime
import arrow
import calendar


class TimeAction(object):

    @staticmethod
    def com_get_timestamp_with_fmt_time(_time: str, fmt: str = "%Y-%m-%d"):
        """

        :param fmt: 指定时间格式，比如 "2021-08-30"
        :param _time: 时间
        :return:
        """
        _timestamp = time.strptime(_time, fmt)
        unix_timestamp = time.mktime(_timestamp)
        return str(int(unix_timestamp))

    @staticmethod
    def com_get_date_delta(years=0, months=0, days=0, hours=0, minutes=0, seconds=0):
        """
        间隔时间的时间，格式为：2021-10-25T10:42:40.811341+08:00
        全部参数为0时，表示当前时间。

        :param years: 0 表示当前年，-1 表示去年， 1 表示未来的一年， 依次类推
        :param months: 0 表示当前月，-1 表示上个月， 1 表示未来一个月， 依次类推
        :param days: 0 表示当天，-1 表示昨天， 1 表示未来一天， 依次类推
        :param hours: 0 表示当前小时，-1 表示过去一小时， 1 表示未来的一小时， 依次类推
        :param minutes: 0 表示当前分钟，-1 表示过去的一分钟， 1 表示未来的一分钟， 依次类推
        :param seconds: 0 表示当前秒，-1 表示的一秒， 1 表示未来的一秒， 依次类推
        :return:
        """
        return arrow.now().shift(years=years, months=months,
                                 days=days, hours=hours, minutes=minutes,
                                 seconds=seconds)

    @staticmethod
    def com_get_timestamp_with_delta(years=0, months=0, days=0, hours=0, minutes=0, seconds=0):
        """
        获取一定时间间隔内的Unix时间戳，可以是未来或过去的时间，全部参数为0时，是当前时间。
        :param years:
        :param months:
        :param days:
        :param hours:
        :param minutes:
        :param seconds:
        :return:

        Example:
        timestamp_past = TimeAction.get_timestamp_with_delta(minutes=-10)
        """
        return str(int(arrow.now().shift(years=years, months=months, days=days,
                                         hours=hours, minutes=minutes, seconds=seconds).timestamp()))

    @staticmethod
    def com_get_ms_timestamp_with_delta(years=0, months=0, days=0, hours=0, minutes=0, seconds=0):
        """
        Get timestamp with delta; return as milliseconds.
        Support to get timestamp in the past with negative value.
        :param years:
        :param months:
        :param days:
        :param hours:
        :param minutes:
        :param seconds:
        :return:

        Example:
        timestamp_past = TimeAction.get_ms_timestamp_with_delta(minutes=-10)
        """
        return str(round(arrow.now().shift(years=years, months=months,
                                           days=days, hours=hours, minutes=minutes,
                                           seconds=seconds).float_timestamp*1000))

    @staticmethod
    def com_get_time_countdown(end_year, end_month, end_day, end_hour=0, end_minute=0, end_seconds=0):
        """

        :param end_year:
        :param end_month:
        :param end_day:
        :param end_hour:
        :param end_minute:
        :param end_seconds:
        :return:
        """
        end_d = datetime.datetime(int(end_year), int(end_month), int(end_day), int(end_hour),
                                  int(end_minute), int(end_seconds))
        now_d = datetime.datetime.now()
        return int((end_d-now_d).total_seconds())

    @staticmethod
    def com_get_format_time_of_now(fmt="YYYY-MM-DD"):
        """

        :param fmt:
        :return:
        """
        return arrow.now().format(fmt)

    @staticmethod
    def com_get_format_time_of_before(fmt="YYYY-MM-DD", days = -1):
        """
        获取之前任意天的日期YYYY-MM-DD
        :param fmt:
        :return:
        """
        certain_timestamp = datetime.datetime.today() + datetime.timedelta(days)
        certain_date = certain_timestamp.strftime('%Y-%m-%d')
        return certain_date

    @staticmethod
    def com_get_current_time_ms():
        """
        获取当前的时间戳(13位)
        :return:
        """
        a = time.time()*1000
        return str(int(a))

    @staticmethod
    def com_get_current_time():
        """
        获取当前的时间戳(10位)
        :return:
        """
        a = time.time()
        return str(int(a))

    @staticmethod
    def com_get_ISO_time(str_time):
        """

        :param str_time:
        :return:
        """
        dt = datetime.datetime.strptime(str_time, '%Y-%m-%dT%H:%M:%S.%f%z')
        dtt = datetime.datetime.strftime(dt, '%Y-%m-%d %H:%M:%S')
        return dtt

    @staticmethod
    def com_get_days_with_current_month():
        """
        获取当前月份的自然天数
        :return:
        """
        _now = datetime.datetime.now()
        _cal = calendar.monthrange(_now.year, _now.month)
        return _cal[1]

    @staticmethod
    def com_get_days_with_appoint_time(year, month):
        """
        通过指定年和月，获取指定年-月份的天数
        :param year:
        :param month:
        :return:
        """
        return calendar.monthrange(year, month)[1]

    def com_get_fmt_with_delta(self, years=0, months=0, days=0, hours=0, minutes=0, seconds=0):
        """
        按特定格式，获取指定的时间，默认是当前时间
        :param years:
        :param months:
        :param days:
        :param hours:
        :param minutes:
        :param seconds:
        :return: 2021-09-02T15:26:44.807322+08:00
        """
        _now_time = self.com_get_date_delta(years=years, months=months, days=days, hours=hours, minutes=minutes, seconds=seconds)
        _fmt = _now_time.__str__().split("T")[0]
        return _fmt

    def com_get_fmt_with_delta_str(self, time_str="00:00:00", years=0, months=0, days=-1, hours=0, minutes=0, seconds=0):
        """
        按格式获取时间，如：2021-09-02 00:00:00
        :param years:
        :param months:
        :param days:
        :param hours:
        :param minutes:
        :param seconds:
        :param time_str:
        :return:
        """
        _time = self.com_get_fmt_with_delta(years=years, months=months, days=days, hours=hours, minutes=minutes, seconds=seconds)
        return _time + " " + time_str

    def com_get_timestamp_with_fmt(self, time_str, fmt="%Y-%m-%d %H:%M:%S"):
        """
        通过指定格式的日期，获取时间戳
        :param time_str:
        :param fmt:
        :return:
        """
        return int(time.mktime(time.strptime(time_str, fmt)))

    def com_get_yesterday_timestamp(self):
        """
        获取开始的指定天的，开始到结束的时间戳，
            开始：00:00:00
            结束：23:55:00

        如：2021-09-02 00:00:00  2021-09-02 23:55:00
        :return:
        """
        _start = self.com_get_fmt_with_delta_str()
        print("_start: {}".format(_start))
        _end = self.com_get_fmt_with_delta_str("23:55:00")
        return [self.com_get_timestamp_with_fmt(_start),
                self.com_get_timestamp_with_fmt(_end), _start, _end]

    def com_get_yesterday_days_in_month(self):
        """
        获取昨天所在月份的自然天数
        :return:
        """
        _yes_timestamp = self.com_get_timestamp_with_delta(days=-1)
        print("_yes_timestamp: {}".format(_yes_timestamp))
        utc_time_stamp = datetime.datetime.fromtimestamp(int(_yes_timestamp))

        __year = utc_time_stamp.year
        __month = utc_time_stamp.month
        _mon_ = calendar.monthrange(__year, __month)
        return _mon_[1]
    
    # def com_get_yesterday_days_in_month(self):
    #     """
    #     获取昨天所在月份的自然天数
    #     :return:
    #     """
    #     _yes_timestamp = self.com_get_timestamp_with_delta(days=-1)
    #     # utc_time_stamp = datetime.datetime.utcfromtimestamp(int(_yes_timestamp))
    #     # The method "utcfromtimestamp" in class "datetime" is deprecated 
    #     # Use timezone-aware objects to represent datetimes in UTC; e.g. by calling .fromtimestamp(datetime.UTC)Pylance
    #     utc_time_stamp = datetime.datetime.fromtimestamp(int(_yes_timestamp))

    #     __year = utc_time_stamp.year
    #     __month = utc_time_stamp.month
    #     _mon_ = calendar.monthrange(__year, __month)
    #     return _mon_[1]

    def com_get_days_in_month(self, _fmt: str = "", is_day="yes"):
        """
        获取月份的天数
        :param _fmt:
        :param is_day:
        :return:
        """
        if is_day == "assign":
            _t = _fmt.split(" ")[0].split("-")
            return self.com_get_days_with_appoint_time(year=int(_t[0]), month=int(_t[1]))
        else:
            return self.com_get_yesterday_days_in_month()

    def com_get_timestamp_with_slot(self, _start, _end):
        """
        指定开始时间、结束时间，获取开始和结束时间的时间戳
        :param _start: 如 2021-09-01
        :param _end: 如 2021-10-13
        :return:
        """
        start_time = _start + " 00:00:00"
        end_time = _end + " 23:59:59"
        start_time_stamp = self.com_get_timestamp_with_fmt(start_time)
        end_time_stamp = self.com_get_timestamp_with_fmt(end_time)
        return [start_time_stamp, end_time_stamp]

    def com_get_delta_day_start_end_timestamp(self, _day=0):
        """
        获取当天、间隔一天、两天、…… 日期的开始、结束时间戳
        开始 00:00:00 , 结束 23:59:59
            _day = 0 : 当天
            _day = -1 : 昨天
            _day = -2 : 前天
        :param _day:
        :return:
        """
        _current_time = self.com_get_date_delta(days=_day)
        _cur_day_start = _current_time.__str__().split("T")[0]
        _cur_day_end = _current_time.__str__().split("T")[0]
        return self.com_get_timestamp_with_slot(_cur_day_start, _cur_day_end)

    def com_get_current_day_start_to_current_timestamp(self):
        """
        获取当天开始到当前时间点的时间戳
        :return:
        """
        _start = self.com_get_delta_day_start_end_timestamp()[0]
        _end = self.com_get_current_time()
        return _start, int(_end)

    def com_get_delta_month_begin_end_timestamp(self, month=-1):
        """
        根据月间隔，获取所在月份开始和结束时间的时间戳
        :param month:
        :return:
        """
        month_begin_end = self.com_get_last_month_begin_end_format(month)
        _start = month_begin_end[0]
        _end = month_begin_end[1]
        return self.com_get_timestamp_with_slot(_start, _end)
    
    def com_get_delta_month_begin_end_time(self, month=-1):
        """
        根据月间隔，获取所在月份开始和结束时间的时间戳
        :param month:
        :return:
        """
        month_begin_end_list = self.com_get_delta_month_begin_end_timestamp(month)
        start = self.com_get_format_time_by_timestamp(month_begin_end_list[0])
        end = self.com_get_format_time_by_timestamp(month_begin_end_list[1])
        return start, end

    def com_get_timestamp_cur_mon_begin_to_yesterday(self):
        """
        获取当月的开始时间的时间戳、截止到昨天 25:59:59 的时间戳
        :return:
        """
        _yes_time = self.com_get_date_delta(days=-1)
        # 获取年月日, 2021-02-01
        _yes_year_mon_day = _yes_time.__str__().split("T")[0]
        # 获取昨天所在月份的第一天
        _yes_year_mon_first_day = _yes_year_mon_day[:7] + "-01"
        return self.com_get_timestamp_with_slot(_yes_year_mon_first_day, _yes_year_mon_day)

    def com_get_last_month_format_time(self, month=-1, _format="%Y-%m"):
        """
        获取过去指定月份时间所在的月份，默认是上个月
        :param month:
        :param _format:
        :return:
        """
        _timestamp_delta = self.com_get_timestamp_with_delta(months=month)
        _f = time.strftime(_format, time.localtime(int(_timestamp_delta)))
        return _f

    def com_get_last_month_begin_end_format(self, month=-1, _format='%Y-%m-%d'):
        """
        获取指定月份的开始、结束时间，限制格式
        :param month:
        :param _format:
        :return:
        """
        _timestamp_delta = self.com_get_timestamp_with_delta(months=month)
        utc_time_stamp = datetime.datetime.utcfromtimestamp(int(_timestamp_delta))
        __year = utc_time_stamp.year
        __month = utc_time_stamp.month
        __day = utc_time_stamp.day
        _mon_ = calendar.monthrange(__year, __month)  # 30
        f_begin = str(__year) + "-" + str(__month).rjust(2, '0') + "-01"
        f_end = str(__year) + "-" + str(__month).rjust(2, '0') + "-" + str(_mon_[1]).rjust(2, '0')

        return f_begin, f_end

    def com_get_yesterday_format(self, days=-1, _format='%Y-%m-%d'):
        """
        获取特定天的时间格式：
        :param days:
            days=-1, 昨天
            days=-7, 7天前
        :param _format:
        :return:
        """
        _timestamp_delta = self.com_get_date_delta(days=days)
        _yesterday = _timestamp_delta.__str__().split("T")[0]

        return _yesterday

    def com_get_current_time_format_t(self, days=0, _format='%Y-%m-%d'):
        """
        获取特定天的时间格式: "2022-01-26T17:20:19+08:00"
        :param days:
            days=-1, 昨天
            days=-7, 7天前
        :param _format:
        :return:
        """
        _timestamp_delta = self.com_get_date_delta(days=days)
        _cur_time_dot = _timestamp_delta.__str__().split(".")[0]
        _cur_time_add = _timestamp_delta.__str__().split("+")[-1]
        return _cur_time_dot + "+" + _cur_time_add

    def get_current_month_start_timestamp_00_00_00(self, _month=0):
        """
        获取当月 开始的时间戳, 如 2021-10-01 00:00:00 ---> 1633017600

        _month = 0: 当月的
        _month = -1: 上个月的
        _month = -2: 上上个月的
        依次类推

        :return:
        """
        _start = self.com_get_last_month_begin_end_format(month=_month)[0]
        _end = self.com_get_last_month_begin_end_format(month=_month)[1]
        current_month_start_timestamp = self.com_get_timestamp_with_slot(_start, _end)[0]
        return current_month_start_timestamp

    def get_last_month_array(self, _month=-1):
        """
        获取上个月时间array,
        time.struct_time(tm_year=2021, tm_mon=12, tm_mday=1, tm_hour=0, tm_min=0, tm_sec=0, tm_wday=2, tm_yday=335, tm_isdst=0)
        :return:
        """
        _last_month_timestamp = self.get_current_month_start_timestamp_00_00_00(_month)
        print(_last_month_timestamp)
        _time_array = time.localtime(_last_month_timestamp)
        return _time_array

    def get_current_month_current_timestamp_23_59_59(self, _month=0):
        """
        获取当月 当天截止的时间戳, 默认是当天晚上23:59:59
            如今天是2021年10月25号，获取 2021-10-25 23:59:59 ---> 1635177599

        _month = 0: 当月的
        _month = -1: 上个月的
        _month = -2: 上上个月的
        依次类推
        :return:
        """
        _current_time_format = self.com_get_date_delta(months=_month)   # 2021-10-25T10:09:33.292733+08:00
        _start = self.com_get_last_month_begin_end_format(month=_month)[0]
        _end_last_month_time = self.com_get_last_month_begin_end_format(month=_month)[1]
        _end = _current_time_format.__str__().split("T")[0]
        if _month == 0:
            current_month_current_timestamp = self.com_get_timestamp_with_slot(_start, _end)[1]
        else:
            current_month_current_timestamp = self.com_get_timestamp_with_slot(_start, _end_last_month_time)[1]
        return current_month_current_timestamp

    def get_format_time_by_delta_00_55(self, last_days=-7):
        """
        获取昨天，过去一段时间内，比如7天，一个月的每天的开始和结束时间：
            2021-10-19 00:00:00 和 2021-10-19 23:55:00
        :param last_days:
        :return:
        """
        delta_list = []
        for i in range(last_days, 0):
            _day_start = TimeAction().com_get_fmt_with_delta_str(days=i)
            _day_end = TimeAction().com_get_fmt_with_delta_str(time_str='23:55:00', days=i)
            delta_list.append({"day_start": _day_start, "day_end": _day_end})
        return delta_list

    def com_get_format_time_by_timestamp(self, _timestamp, fmt="%Y-%m-%d %H:%M:%S"):
        """
        将10位的时间戳转为指定格式的时间
        :param _timestamp:
        :param fmt:
        :return:
        """

        if _timestamp < 0:
            return datetime.datetime(1970, 1, 1) + datetime.timedelta(seconds=int(_timestamp))
        else:
            time_array = time.localtime(int(_timestamp))
            result_time = time.strftime(fmt, time_array)
            return result_time

    def com_get_current_month_start_end_by_format(self, _fmt="%Y-%m-%d"):
        """
        获取当月的开始、结束时间，如格式：2021-11-01
        :param _fmt:
        :return:
        """
        _start = self.com_get_last_month_begin_end_format(month=0)[0]
        _end = self.com_get_format_time_by_timestamp(_timestamp=int(TimeAction().com_get_current_time()),
                                                     fmt="%Y-%m-%d")
        return _start, _end

    def com_get_current_time_with_format(self, _fmt="%Y-%m-%d"):
        """
        获取当天日期，格式：2021-11-22
        :param _fmt:
        :return:
        """
        return self.com_get_format_time_by_timestamp(_timestamp=int(TimeAction().com_get_current_time()), fmt=_fmt)

    def update_result_datetime_to_stamp(self, result_dict_list: list):
        """
        更新时间
        :param result_dict_list:
        :return:
        """
        new_result = []
        # 更新返回结果中的时间格式为字符串格式
        for re in result_dict_list:
            print("--re--:", re)
            if "createTime" in re:
                re.update({"createTime": int(re['createTime'].replace(tzinfo=datetime.timezone.utc).timestamp())})

            if "bindTime" in re:
                re.update({"bindTime": int(re['bindTime'].replace(tzinfo=datetime.timezone.utc).timestamp())})

            if "abandonTime" in re:
                re.update({"abandonTime": int(re['abandonTime'].replace(tzinfo=datetime.timezone.utc).timestamp())})

            if "latestOfflineTime" in re:
                re.update({"latestOfflineTime": int(re['latestOfflineTime'].replace(tzinfo=datetime.timezone.utc).timestamp())})

            if "testPassedTime" in re:
                re.update({"testPassedTime": int(re['testPassedTime'].replace(tzinfo=datetime.timezone.utc).timestamp())})

            if re['deviceBandwidthTestResult']:
                if "upBandwidthTestTime" in re['deviceBandwidthTestResult']:
                    re['deviceBandwidthTestResult'].update({"upBandwidthTestTime": int(
                        re['deviceBandwidthTestResult']['upBandwidthTestTime'].
                            replace(tzinfo=datetime.timezone.utc).timestamp() if re['deviceBandwidthTestResult']['upBandwidthTestTime'] != 0 else 0)})

                if "compensationTime" in re['deviceBandwidthTestResult']:
                    re['deviceBandwidthTestResult'].update({"compensationTime": int(
                        re['deviceBandwidthTestResult']['compensationTime'].
                            replace(tzinfo=datetime.timezone.utc).timestamp() if re['deviceBandwidthTestResult']['compensationTime'] != 0 else 0)})

                if "iopsTestTime" in re['deviceBandwidthTestResult']:
                    re['deviceBandwidthTestResult'].update({"iopsTestTime": int(re['deviceBandwidthTestResult']['iopsTestTime'].replace(tzinfo=datetime.timezone.utc).timestamp())})

            if re['deviceTaskInfo']:
                if "taskDeployTime" in re['deviceTaskInfo']:
                    re['deviceTaskInfo'].update({"taskDeployTime": int(re['deviceTaskInfo']['taskDeployTime'].replace(tzinfo=datetime.timezone.utc).timestamp())})

                if "tasksDeployTime" in re['deviceTaskInfo']:
                    if re['deviceTaskInfo']['tasksDeployTime']:
                        _keys = re['deviceTaskInfo']['tasksDeployTime'].keys()
                        for _k in _keys:
                            re['deviceTaskInfo']['tasksDeployTime'].update({
                                _k: int(re['deviceTaskInfo']['tasksDeployTime'][_k].replace(tzinfo=datetime.timezone.utc).timestamp())
                            })

            new_result.append(re)
        return new_result

    def com_get_day_in_date(self, _day=-1):
        """
        获取前一天date列表，如['2022','2','14']
        开始
            _day = 0 : 当天
            _day = -1 : 昨天
            _day = -2 : 前天
        :param _day:
        :return:
        """
        _current_time = self.com_get_date_delta(days=_day)
        _cur_date = _current_time.__str__().split("T")[0]
        _cur_date_list = _cur_date.split("-")
        return _cur_date_list

    def get_current_month_end_timestamp_00_00_00(self, _month=-1):
        """
        获取上月 开始的时间戳, 如 2021-10-01 00:00:00 ---> 1633017600

        _month = 0: 当月的
        _month = -1: 上个月的
        _month = -2: 上上个月的
        依次类推

        :return:
        """
        _end = self.com_get_last_month_begin_end_format(month=_month)[1]
        print("_end: {}".format(_end))
        end_time = _end + " 00:00:00"
        end_time_stamp = self.com_get_timestamp_with_fmt(end_time)
        return end_time_stamp

    def com_get_specific_days_in_month(self, years=0, months=0, days=0, hours=0, minutes=0, seconds=0):
        """
        获取昨天所在月份的自然天数
        :return:
        """
        _yes_timestamp = self.com_get_timestamp_with_delta(years, months, days, hours, minutes, seconds)
        # utc_time_stamp = datetime.datetime.utcfromtimestamp(int(_yes_timestamp))
        utc_time_stamp = datetime.datetime.fromtimestamp(int(_yes_timestamp))
        __year = utc_time_stamp.year
        __month = utc_time_stamp.month
        _mon_ = calendar.monthrange(__year, __month)
        return _mon_[1]

    def com_get_last_week_time_range(self, week = -1):
        """
        获取上周的开始结束时间戳 如：周一 00：00：00 ~ 周日 23：59：59
        :param week:
        :return:
        """
        stimeStamp = TimeAction().com_get_delta_day_start_end_timestamp(0)[0]
        delta_day = datetime.datetime.today().isoweekday() + 7 * abs(week) - 1
        last_week_start_timestamp = stimeStamp - delta_day * 24 * 60 * 60
        last_week_end_timestamp = last_week_start_timestamp + 24 * 60 * 60 * 7 - 1
        return last_week_start_timestamp, last_week_end_timestamp

    def com_transform_datetime_to_fmt(self,timestamp, fmt="%Y-%m-%d"):
        if not timestamp:
            print("Need Parm timestamp in com_transform_datetime_to_fmt")
        else:
            res = time.strftime(fmt, time.localtime(timestamp))
            return res

    def time_long_value(self, time_old, time_new, _type="day"):
        """
        计算时间差
        :param time_old: 较小的时间（datetime类型）
        :param time_new: 较大的时间（datetime类型）
        :param _type: 返回结果的时间类型（暂时就是返回相差天数）
        :return: 相差的天数
        """
        day1 = time.strptime(str(time_old), '%Y-%m-%d')
        day2 = time.strptime(str(time_new), '%Y-%m-%d')
        if _type == 'day':
            day_num = (int(time.mktime(day2)) - int(time.mktime(day1))) / (24 * 60 * 60)
            return int(day_num)
        
    def com_get_last_week_time_range_friday_thursday(self, week = -1):
        """
        获取上周的开始结束时间戳 如：周一 00：00：00 ~ 周日 23：59：59
        :param week:
        :return:
        """
        #获取当前日期00:00:00时间戳
        stimeStamp = TimeAction().com_get_delta_day_start_end_timestamp(0)[0]
        #获取上周五00:00:00距离今天的天数间隔
        delta_day = datetime.datetime.today().isoweekday() + 7 * abs(week) + 3 - 1
        #减去天数间隔
        last_week_start_timestamp = stimeStamp - delta_day * 24 * 60 * 60
        last_week_end_timestamp = last_week_start_timestamp + 24 * 60 * 60 * 7 - 1
        return last_week_start_timestamp, last_week_end_timestamp

    def get_n_days_before_time(self, days= -1):
        n_days_before_timestamp = int(self.com_get_current_time()) - 24 * 60 * 60 * abs(days)
        n_days_before_datetime = self.com_get_format_time_by_timestamp(n_days_before_timestamp, fmt="%Y-%m-%d %H:%M:%S")
        return n_days_before_datetime
    
    def com_get_days_diff_in_datetime(self, time_s, time_e):
        """
        获取天数间隔 如：'2023-09-08 00:00:00' ~ '2023-09-14 23:59:59' 天数间隔
        :param week:
        :return:
        """
        timestamp_s = self.com_get_timestamp_with_fmt(time_s, fmt="%Y-%m-%d %H:%M:%S")
        timestamp_e = self.com_get_timestamp_with_fmt(time_e, fmt="%Y-%m-%d %H:%M:%S")
        time_diff = abs(timestamp_s - timestamp_e)
        days_diff = round(time_diff / 24 / 60 / 60)
        return days_diff
    
    def com_get_second_diff_in_datetime(self, time_s, time_e):
        """
        获取天数间隔 如：'2023-09-08 00:00:00' ~ '2023-09-14 23:59:59' 天数间隔
        :param week:
        :return:
        """
        timestamp_s = self.com_get_timestamp_with_fmt(time_s, fmt="%Y-%m-%d %H:%M:%S")
        timestamp_e = self.com_get_timestamp_with_fmt(time_e, fmt="%Y-%m-%d %H:%M:%S")
        second_diff = abs(timestamp_s - timestamp_e)
        return second_diff
    
    def get_today_end_time(self):
        """
        获取当前程序执行时间 2023-12-25 23:59:59
        :param week:
        :return:
        """
        _now = datetime.datetime.now()
        year = _now.year
        months = _now.month
        day = _now.day
        last_month =  months if months > 0 else 12 
        date_time_now = f"{year}-{last_month}-{day} 23:59:59"
        return date_time_now
    
    def get_weeks_since_startday(self, start_date, end_date):
        """
        获取 2023-12-15 到目前的每周时间 list 如：[['2023-12-15 00:00:00', '2023-12-21 23:59:59'], ['2023-12-22 00:00:00', '2023-12-28 23:59:59']...]
        :param end_date: "2024-04-05"
        :return:
        """
        # start_date = datetime.datetime(2023, 12, 15)
        start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        # end_date 转成 datetime.datetime 类型
        end_date = datetime.datetime.strptime(end_date, "%Y-%m-%d")

        current_date = start_date
        week_ranges = []

        while current_date < end_date:
            # print("current_date:", current_date)
            # Find the next Friday
            while current_date.weekday() != 4:  # Friday is represented as 4 in Python
                current_date += datetime.timedelta(days=1)
            start_of_week = current_date
            # Find the next Thursday
            while current_date.weekday() != 3:  # Thursday is represented as 3 in Python
                current_date += datetime.timedelta(days=1)
            end_of_week = current_date + datetime.timedelta(hours=23, minutes=59, seconds=59)
            week_ranges.append([start_of_week.strftime("%Y-%m-%d %H:%M:%S"), end_of_week.strftime("%Y-%m-%d %H:%M:%S")])
            current_date += datetime.timedelta(days=1)  # Move to next Friday

        return week_ranges




if __name__ == "__main__":
    # print(TimeAction().com_get_last_week_time_range(week=-2))
    # print(TimeAction().com_get_format_time_of_before(_time="1644768000"))
    # print(TimeAction().com_get_timestamp_with_fmt("2022-05-01", fmt="%Y-%m-%d"))
    # print(TimeAction().com_get_yesterday_format(_format='%Y-%m-%d').replace("-", ""))
    # print(TimeAction().com_get_delta_month_begin_end_timestamp())
    # print("月份:", str(TimeAction().get_last_month_array()[1]))

    # print(TimeAction().com_get_yesterday_format(days=-1))
    # print(TimeAction().com_get_delta_month_begin_end_timestamp(month=-1))
    # print(TimeAction().com_get_last_month_begin_end_format())
    # print("当天、指定日期的开始结束时间戳: {}".format(TimeAction().com_get_timestamp_with_fmt("20230101", fmt="%Y%m%d")))
    # print("当天、指定日期的开始结束时间戳: {}".format(TimeAction().com_get_yesterday_days_in_month()))
    print("当天、指定日期的开始结束时间戳: {}".format(TimeAction().com_get_delta_month_begin_end_time(month=-1)))
    # print("当月开始的时间戳: {}".format(TimeAction().get_current_month_start_timestamp_00_00_00()))  # 1633017600
    # print("上月月开始的时间戳: {}".format(TimeAction().get_current_month_start_timestamp_00_00_00(_month=-1)))  # 1633017600
    # print("当月当前天截止的时间戳: {}".format(TimeAction().get_current_month_current_timestamp_23_59_59()))  # 1635177599
    # print("上月当前天截止的时间戳: {}".format(TimeAction().get_current_month_current_timestamp_23_59_59(_month=-1)))  # 1635177599
    # print("指定时间区间内的开始和结束时间戳: {}".format(TimeAction().com_get_timestamp_with_slot("2023-03-20", "2023-03-21")))
    # print("__com_get_format_time_of_now: {}".format(TimeAction().com_get_format_time_of_now()))
    # print("com_get_date_delta: {}".format(TimeAction().com_get_date_delta()))
    # delta_list = TimeAction().get_format_time_by_delta_00_55()
    # for _ in delta_list:
    #     print(_)
    # print(TimeAction().com_get_last_month_begin_end_format(month=0))
    # print(TimeAction().com_get_format_time_by_timestamp(_timestamp=int(TimeAction().com_get_current_time()),
    #                                                               fmt="%Y-%m-%d"))



