module.exports = {
  path: '/time',
  info: "Gives current time in various ways",
  type: "get",
  params: [
    {
      name: 'offset',
      required: false,
      default: '0'
    }
  ],
  category: "text",

  async execute(req, res) {
    let date = req.query["offset"] ? new Date(new Date() + Number(req.query["offset"])) : new Date()
    res.json({
      unix: Math.floor(date.getTime() / 1000),
      unix_ms: date.getTime()/1,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day_week: date.getDay(),
      day: date.getDate(),
      hour: (date.getHours()),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      ms: date.getMilliseconds(),
      date: date.toDateString(),
      gmt: date.toGMTString(),
      iso: date.toISOString(),
      utc: date.toUTCString()
    })
  }
}