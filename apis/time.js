module.exports = {
  path: '/time',
  info: "Gives current time in various ways",
  type: "get",
  params: ["offset", false],
  category: "text",
  execute(req, res){
    let date = req.query["offset"] ? new Date(new Date() + req.query["offset"]) : new Date()
    res.send(`{
  "unix": "${Math.floor(date.getTime() / 1000)}",
  "year": "${date.getFullYear()}",
  "month": "${date.getMonth() + 1}",
  "day-week": "${date.getDay()}",
  "day": "${date.getDate()}",
  "hour": "${(date.getHours())}",
  "minute": "${date.getMinutes()}",
  "second": "${date.getSeconds()}",
  "ms": "${date.getMilliseconds()}",
  "date": "${date}"
}`)
  }
}