const { Parser } = require('json2csv')

module.exports.downloadResource = async (res, fileName, fields, data) => {
    const json2csv = new Parser({ fields })
    const csv = json2csv.parse(data)
    res.header('Content-Type', 'text/csv')
    res.attachment(fileName)
    return res.send(csv)
}
module.exports.getWxOpenId = async (req) => {
    let openId = req.headers["x-wx-source"]
    return openId
}
module.exports.toPagingData = (total_count, pageindex, pagesize, data) => {
    const has_next_page = total_count > pagesize * pageindex
    const total_pages = Math.ceil(total_count / pagesize)
    return { total_count, total_pages, has_next_page, current_page: pageindex, item_count: data.length, items: data }
}