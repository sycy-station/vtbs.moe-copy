const level = require('level')
const fs = require('fs-extra')

class LevelDatabase {
  constructor({ name, db }) {
    this.name = name
    this.db = db
  }
  put(key, value) {
    return this.db.put(`${this.name}_${key}`, value)
  }
  get(key) {
    return this.db.get(`${this.name}_${key}`).catch(() => undefined)
  }
}

class ArrayDatabase extends LevelDatabase {
  constructor({ name, db }) {
    super({ name, db })
  }
  put({ mid = 0, num = 0, value }) {
    return super.put(`${mid}_${num}`, value)
  }
  get({ mid = 0, num = 0 }) {
    return super.get(`${mid}_${num}`)
  }
  bulkGet({ mid = 0, num = 1 }) {
    let bulk = Array(num)
    for (let i = 0; i < bulk.length; i++) {
      bulk[i] = this.get({ mid, num: i + 1 })
    }
    return Promise.all(bulk)
  }
}

exports.init = async () => {
  await fs.ensureDir('./db')
  let db = level(`./db`, { valueEncoding: 'json' })
  let site = new ArrayDatabase({ name: 'site', db })
  let num = new LevelDatabase({ name: 'num', db })

  let info = new LevelDatabase({ name: 'info', db })
  let active = new ArrayDatabase({ name: 'active', db })
  let live = new ArrayDatabase({ name: 'live', db })
  let guard = new ArrayDatabase({ name: 'guard', db })

  let macro = new ArrayDatabase({ name: 'macro', db })
  return { site, num, info, active, live, guard, macro }
}

/*
数据库
site
spider_spiderid: {spiderId, time, duration}

num
macroNum: Number

info
mid: {mid, uname, video, coins, roomid, sign, notice, face, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, areaRank, online, time}

active
mid_recordNum: {archiveView, follower, time}

live
mid_liveNum: {online, time}

guard
mid_liveNum: {guardNum, areaRank, time}

face
mid: time

macro
record_macroNum: {video, coins, archiveView, liveStatus, online}

all: time: timestamp

Increase index:
  recordNum
  liveNum
  guardChange
  macroNum
 */
