export function formatDate(date) {
    console.log("formatDate")
    console.log(date)
    if (date == "" || date == null || date == undefined) {
      return ""
    }
    date = new Date(date)
    return ('00' + (date.getDate())).slice(-2) + "/" + ('00' + (date.getMonth() + 1)).slice(-2) + "/" + ('0000' + (date.getFullYear())).slice(-4)
  }