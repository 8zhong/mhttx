var nameStartChar=/[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,nameChar=new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"),tagNamePattern=new RegExp("^"+nameStartChar.source+nameChar.source+"*(?::"+nameStartChar.source+nameChar.source+"*)?$"),S_TAG=0,S_ATTR=1,S_ATTR_SPACE=2,S_EQ=3,S_ATTR_NOQUOT_VALUE=4,S_ATTR_END=5,S_TAG_SPACE=6,S_TAG_CLOSE=7;function XMLReader(){}XMLReader.prototype={parse:function(a,b,c){var e=this.domBuilder;e.startDocument();_copy(b,b={});parse(a,b,c,e,this.errorHandler);e.endDocument()}};function parse(a,b,c,e,d){function h(a){var b=a.slice(1,-1);if(b in c)return c[b];if("#"===b.charAt(0))return a=parseInt(b.substr(1).replace("x","0x")),65535<a?(a-=65536,a=String.fromCharCode(55296+(a>>10),56320+(a&1023))):a=String.fromCharCode(a),a;d.error("entity not found:"+a);return a}function l(b){if(b>r){var c=a.substring(r,b).replace(/&#?\w+;/g,h);u&&g(r);e.characters(c,0,b-r);r=b}}function g(b,c){for(;b>=f&&(c=m.exec(a));)k=c.index,f=k+c[0].length,u.lineNumber++;u.columnNumber=b-k+1}var k=0,f=0,m=/.*(?:\r\n?|\n)|.*$/g,u=e.locator;b=[{currentNSMap:b}];for(var F={},r=0;;){try{var n=a.indexOf("\x3c",r);if(0>n){if(!a.substr(r).match(/^\s*$/)){var y=e.doc,z=y.createTextNode(a.substr(r));y.appendChild(z);e.currentElement=z}break}n>r&&l(n);switch(a.charAt(n+1)){case "/":var p=a.indexOf("\x3e",n+3),t=a.substring(n+2,p),v=b.pop();0>p?(t=a.substring(n+2).replace(/[\s<].*/,""),d.error("end tag name: "+t+" is not complete:"+v.tagName),p=n+1+t.length):t.match(/\s</)&&(t=t.replace(/[\s<].*/,""),d.error("end tag name: "+t+" maybe not complete"),p=n+1+t.length);var A=v.localNSMap,B=v.tagName==t;if(B||v.tagName&&v.tagName.toLowerCase()==t.toLowerCase()){e.endElement(v.uri,v.localName,t);if(A)for(var G in A)e.endPrefixMapping(G);B||d.fatalError("end tag name: "+t+" is not match the current start tagName:"+v.tagName)}else b.push(v);p++;break;case "?":u&&g(n);p=parseInstruction(a,n,e);break;case "!":u&&g(n);p=parseDCC(a,n,e,d);break;default:u&&g(n);var q=new ElementAttributes,w=b[b.length-1].currentNSMap,p=parseElementStartPart(a,n,q,w,h,d),C=q.length;!q.closed&&fixSelfClosed(a,p,q.tagName,F)&&(q.closed=!0,c.nbsp||d.warning("unclosed xml attribute"));if(u&&C){for(var H=copyLocator(u,{}),x=0;x<C;x++){var D=q[x];g(D.offset);D.locator=copyLocator(u,{})}e.locator=H;appendElement(q,e,w)&&b.push(q);e.locator=u}else appendElement(q,e,w)&&b.push(q);"http://www.w3.org/1999/xhtml"!==q.uri||q.closed?p++:p=parseHtmlSpecialContent(a,p,q.tagName,h,e)}}catch(E){d.error("element parse error: "+E),p=-1}p>r?r=p:l(Math.max(n,r)+1)}}function copyLocator(a,b){b.lineNumber=a.lineNumber;b.columnNumber=a.columnNumber;return b}function parseElementStartPart(a,b,c,e,d,h){for(var l,g,k=++b,f=S_TAG;;){var m=a.charAt(k);switch(m){case "\x3d":if(f===S_ATTR)l=a.slice(b,k),f=S_EQ;else if(f===S_ATTR_SPACE)f=S_EQ;else throw Error("attribute equal must after attrName");break;case "'":case '"':if(f===S_EQ||f===S_ATTR)if(f===S_ATTR&&(h.warning('attribute value must after "\x3d"'),l=a.slice(b,k)),b=k+1,k=a.indexOf(m,b),0<k)g=a.slice(b,k).replace(/&#?\w+;/g,d),c.add(l,g,b-1),f=S_ATTR_END;else throw Error("attribute value no end '"+m+"' match");else if(f==S_ATTR_NOQUOT_VALUE)g=a.slice(b,k).replace(/&#?\w+;/g,d),c.add(l,g,b),h.warning('attribute "'+l+'" missed start quot('+m+")!!"),b=k+1,f=S_ATTR_END;else throw Error('attribute value must after "\x3d"');break;case "/":switch(f){case S_TAG:c.setTagName(a.slice(b,k));case S_ATTR_END:case S_TAG_SPACE:case S_TAG_CLOSE:f=S_TAG_CLOSE,c.closed=!0;case S_ATTR_NOQUOT_VALUE:case S_ATTR:case S_ATTR_SPACE:break;default:throw Error("attribute invalid close char('/')");}break;case "":return h.error("unexpected end of input"),f==S_TAG&&c.setTagName(a.slice(b,k)),k;case "\x3e":switch(f){case S_TAG:c.setTagName(a.slice(b,k));case S_ATTR_END:case S_TAG_SPACE:case S_TAG_CLOSE:break;case S_ATTR_NOQUOT_VALUE:case S_ATTR:g=a.slice(b,k),"/"===g.slice(-1)&&(c.closed=!0,g=g.slice(0,-1));case S_ATTR_SPACE:f===S_ATTR_SPACE&&(g=l);f==S_ATTR_NOQUOT_VALUE?(h.warning('attribute "'+g+'" missed quot(")!!'),c.add(l,g.replace(/&#?\w+;/g,d),b)):("http://www.w3.org/1999/xhtml"===e[""]&&g.match(/^(?:disabled|checked|selected)$/i)||h.warning('attribute "'+g+'" missed value!! "'+g+'" instead!!'),c.add(g,g,b));break;case S_EQ:throw Error("attribute value missed!!");}return k;case "\u0080":m=" ";default:if(" ">=m)switch(f){case S_TAG:c.setTagName(a.slice(b,k));f=S_TAG_SPACE;break;case S_ATTR:l=a.slice(b,k);f=S_ATTR_SPACE;break;case S_ATTR_NOQUOT_VALUE:g=a.slice(b,k).replace(/&#?\w+;/g,d),h.warning('attribute "'+g+'" missed quot(")!!'),c.add(l,g,b);case S_ATTR_END:f=S_TAG_SPACE}else switch(f){case S_ATTR_SPACE:"http://www.w3.org/1999/xhtml"===e[""]&&l.match(/^(?:disabled|checked|selected)$/i)||h.warning('attribute "'+l+'" missed value!! "'+l+'" instead2!!');c.add(l,l,b);b=k;f=S_ATTR;break;case S_ATTR_END:h.warning('attribute space is required"'+l+'"!!');case S_TAG_SPACE:f=S_ATTR;b=k;break;case S_EQ:f=S_ATTR_NOQUOT_VALUE;b=k;break;case S_TAG_CLOSE:throw Error("elements closed character '/' and '\x3e' must be connected to");}}k++}}function appendElement(a,b,c){for(var e=a.tagName,d=null,h=a.length;h--;){var l=a[h],g=l.qName,k=l.value,f=g.indexOf(":");if(0<f)var m=l.prefix=g.slice(0,f),f=g.slice(f+1),m="xmlns"===m&&f;else f=g,m="xmlns"===g&&"";l.localName=f;!1!==m&&(null==d&&(d={},_copy(c,c={})),c[m]=d[m]=k,l.uri="http://www.w3.org/2000/xmlns/",b.startPrefixMapping(m,k))}for(h=a.length;h--;)if(l=a[h],m=l.prefix)"xml"===m&&(l.uri="http://www.w3.org/XML/1998/namespace"),"xmlns"!==m&&(l.uri=c[m||""]);f=e.indexOf(":");0<f?(m=a.prefix=e.slice(0,f),f=a.localName=e.slice(f+1)):(m=null,f=a.localName=e);h=a.uri=c[m||""];b.startElement(h,f,e,a);if(a.closed){if(b.endElement(h,f,e),d)for(m in d)b.endPrefixMapping(m)}else return a.currentNSMap=c,a.localNSMap=d,!0}function parseHtmlSpecialContent(a,b,c,e,d){if(/^(?:script|textarea)$/i.test(c)){var h=a.indexOf("\x3c/"+c+"\x3e",b);a=a.substring(b+1,h);if(/[&<]/.test(a)){if(/^script$/i.test(c))return d.characters(a,0,a.length),h;a=a.replace(/&#?\w+;/g,e);d.characters(a,0,a.length);return h}}return b+1}function fixSelfClosed(a,b,c,e){var d=e[c];null==d&&(d=a.lastIndexOf("\x3c/"+c+"\x3e"),d<b&&(d=a.lastIndexOf("\x3c/"+c)),e[c]=d);return d<b}function _copy(a,b){for(var c in a)b[c]=a[c]}function parseDCC(a,b,c,e){switch(a.charAt(b+2)){case "-":if("-"===a.charAt(b+3)){var d=a.indexOf("--\x3e",b+4);if(d>b)return c.comment(a,b+4,d-b-4),d+3;e.error("Unclosed comment")}break;default:if("CDATA["==a.substr(b+3,6))return d=a.indexOf("]]\x3e",b+9),c.startCDATA(),c.characters(a,b+9,d-b-9),c.endCDATA(),d+3;var d=split(a,b),h=d.length;if(1<h&&/!doctype/i.test(d[0][0]))return a=d[1][0],b=3<h&&/^public$/i.test(d[2][0])&&d[3][0],e=4<h&&d[4][0],d=d[h-1],c.startDTD(a,b&&b.replace(/^(['"])(.*?)\1$/,"$2"),e&&e.replace(/^(['"])(.*?)\1$/,"$2")),c.endDTD(),d.index+d[0].length}return-1}function parseInstruction(a,b,c){var e=a.indexOf("?\x3e",b);return e&&(a=a.substring(b,e).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/))?(c.processingInstruction(a[1],a[2]),e+2):-1}function ElementAttributes(a){}ElementAttributes.prototype={setTagName:function(a){if(!tagNamePattern.test(a))throw Error("invalid tagName:"+a);this.tagName=a},add:function(a,b,c){if(!tagNamePattern.test(a))throw Error("invalid attribute:"+a);this[this.length++]={qName:a,value:b,offset:c}},length:0,getLocalName:function(a){return this[a].localName},getLocator:function(a){return this[a].locator},getQName:function(a){return this[a].qName},getURI:function(a){return this[a].uri},getValue:function(a){return this[a].value}};function _set_proto_(a,b){a.__proto__=b;return a}_set_proto_({},_set_proto_.prototype)instanceof _set_proto_||(_set_proto_=function(a,b){function c(){}c.prototype=b;c=new c;for(b in a)c[b]=a[b];return c});function split(a,b){var c,e=[],d=/'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;d.lastIndex=b;for(d.exec(a);c=d.exec(a);)if(e.push(c),c[1])return e}exports.XMLReader=XMLReader;