from common.FileAction import FileAction
config_path = r"config.ini"
_con = FileAction().read_config(config_path)


class ReadConfigData(object):

    @property
    def get_cfg_has_log(self):
        """
        用例运行是否输出request和response的log内容
        :return:
        """
        return _con.get('run_has_log', 'has_log')

    @property
    def get_cfg_run_env(self):
        """
        获取脚本的运行环境
        :return:
        """
        return _con.get('env', 'env')

    @property
    def get_cfg_verify_database(self):
        """
        是否和数据库中内容进行校验
        :return:
        """
        return _con.get('ver_database', 'ver_database')

    @property
    def get_cfg_print_sql(self):
        """
        是否print待执行的sql语句
        :return:
        """
        return _con.get('print_sql', 'is_sql')

    @property
    def get_cfg_qing_flow_print(self):
        """
        是否打印轻流返回内容
        :return:
        """
        return _con.get('qing_liu', 'is_print_qing_flow')

    @property
    def get_cfg_run_yun(self):
        """
        获取云环境
        :return:
        """
        return _con.get('yun', 'yun')

    @property
    def get_cfg_run_perf(self):
        """
        是否执行性能测试
        :return:
        """
        return _con.get('perf', 'perf')
    
    @property
    def get_aigc_perf(self):
        """
        是否执行性能测试
        :return:
        """
        return _con.get('aigc_perf', 'aigc_perf')


if __name__ == "__main__":
    r = ReadConfigData()
    print(r.get_cfg_has_log)
    print(type(r.get_cfg_has_log))
    print(r.get_cfg_has_log == "True")


