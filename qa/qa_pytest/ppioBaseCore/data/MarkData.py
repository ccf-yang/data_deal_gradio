#!/usr/bin/env python
# -*- coding: UTF-8 -*-

class MarkData(object):

    def __init__(self, keywords: dict = None):
        self._keywords = keywords or {}

    @property
    def keyword(self):
        return self._keywords

    @property
    def module(self):
        return self.keyword.get('module')

    def __getattr__(self, item):
        return self.keyword.get(item, None)


if __name__ == "__main__":

    m = MarkData()

    print(m.keyword)
