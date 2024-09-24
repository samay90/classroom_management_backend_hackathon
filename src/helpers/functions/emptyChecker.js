const isEmpty = (d) => {
  if (typeof d == "string") {
    if (!d) return true;
     else if (d == "null" ||d == "undefined") return true;
     else return false;
  } else if (typeof d == "number") {
    if (d == 0) return true;
    else return false;
  } else if (typeof d == "boolean") {
    if (d) return false;
    else return true;
  } else if (typeof d == "undefined") return true;
  else if (typeof d == "object") {
    if (d == null) return true;
    else if (Array.isArray(d)) {
      if (d.length == 0) return true;
      else if (d.length == 1) return isEmpty(d[0]);
      else return false;
    } else if (Object.keys(d).length == 0) return true;
  } else return false;
};

console.log(isEmpty("dsd"));
