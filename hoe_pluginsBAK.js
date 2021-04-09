


var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}


const newLine = (detailPanel, label, value) => {
    var p1    = document.createElement('p');
    var p2    = document.createElement('p');

    var label   = document.createTextNode(label);
    var value   = document.createTextNode(value? value : "-");
    p1.className ='myLabel';
    p2.className ='myValue';

    p1.appendChild(label);
    p2.appendChild(value);

    detailPanel.appendChild(p1);
    detailPanel.appendChild(p2);
}



const updateDetailPanel = (data) => {
    var detailPanel =  document.getElementById('detailPanel');

    // delete all childs, before recreating them :-)
    while (detailPanel.firstChild) {
        detailPanel.removeChild(detailPanel.firstChild);
    }

    newLine (detailPanel, "ServiceCall", data[0].sc.code);
    newLine (detailPanel, "Equpimentname", data[0].eq.name);
    newLine (detailPanel, "Installationspreis", data[0].installationPrice+" "+data[0].installationPriceCurrency);
    newLine (detailPanel, "Ebene", data[0].floor);
    newLine (detailPanel, "Raum",  data[0].room);
    newLine (detailPanel, "Gebäude", data[0].eq.building);
    newLine (detailPanel, "Seriennummer", data[0].eq.serialNumber);

}


const createAttachmentLinkElement = (url, text, type, id,  cloudHost, account, company) => {

    var tr = document.createElement('tr');
    var td = document.createElement('td');

    tr.appendChild(td);


    var img = document.createElement('img');
    img.src="png/"+type.toLowerCase()+".png";
    td.appendChild(img);

    img.width="20";

    td = document.createElement('td');
    tr.appendChild(td);


    var a = document.createElement('a');
    var linkText = document.createTextNode(text);
    a.appendChild(linkText);
    a.title = text;
    a.setAttribute('href', "#");
    a.onclick= function() {
        //window.alert("Clicked:"+id);
      //  window.alert(`bearer ${sessionStorage.getItem('token')}`);
        //let binaryData = await getAllActivityAttachments(cloudHost, account, company, activityID);
        downloadAttachments(cloudHost, account, company, id);
    };
    td.append(a);
    return tr;
}


const download = () => {
    window.alert("Downloading!");
}

const updateAttachmentPanel = (data, cloudHost, account, company) => {
    var attachmentPanel =  document.getElementById('attachmentPanel');

    // delete all childs, before recreating them :-)
    while (attachmentPanel.firstChild) {
        attachmentPanel.removeChild(attachmentPanel.firstChild);
    }


    var p1    = document.createElement('p');

    var label   = document.createTextNode("Anlagen");
    p1.className ='myLabel';
    p1.appendChild(label);

    attachmentPanel.appendChild(p1);

    var table = document.createElement("table");

//debugger;
    for(var i=0;i<data.length;i++) {
        var attId       = data[i].att.id;
        var fileName    = data[i].att.fileName;
        var type        = data[i].att.type;
        var link        = data[i].att.fileName;
        table.appendChild(createAttachmentLinkElement(link, fileName, type, attId,  cloudHost, account, company));
    }

    attachmentPanel.appendChild(table);


}



function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return Base64.encode( binary );
}







// ************************************************************************************************
// Read all information regarding the Activity including service call and equipment             **
// ************************************************************************************************
function getAllActivityDetails(cloudHost, account, company, activity_id) {

    const headers = {
        'Content-Type': 'application/json',
        'X-Client-ID': 'fsm-extension-sample',
        'X-Client-Version': '1.0.0',
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
    };

    var coreSQL = `SELECT sc.code,
                            act.code,
                            eq.code,
                            eq.name,
                            eq.serialNumber,
                            eq.manufacturerSerialNumber,
                            eq.status,
                            getUdfByName(eq, 'Room') as room,
                            getUdfByName(eq, 'Building') as building,
                            getUdfByName(eq, 'Floor') as floor,
                            getUdfByName(act, 'InstallationPriceCurrency') as installationPriceCurrency,
                            getUdfByName(act, 'InstallationPrice') as installationPrice
                    FROM Activity act
                    LEFT JOIN ServiceCall sc ON sc.id=act .object.objectId
                    LEFT JOIN Equipment eq ON eq.id= act .equipment
                    WHERE act .id = '`+activity_id+`'`;

    return new Promise(resolve => {

        const result1 =  fetch(`https://${cloudHost}/api/query/v1/?account=${account}&company=${company}&dtos=Activity.38;Equipment.22;ServiceCall.26`, {
            headers,
            body    : 	JSON.stringify({query: coreSQL}),
            method  :   'POST'
        }) .then(response => response.json())
            .then(function(json) {
                //console.info("Data",json.data );
                resolve(json.data);
            });


    });
}




// ************************************************************************************************
// Read all information regarding the Activity including service call and equipment             **
// ************************************************************************************************
function getAllActivityAttachments(cloudHost, account, company, activity_id) {

    const headers = {
        'Content-Type': 'application/json',
        'X-Client-ID': 'fsm-extension-sample',
        'X-Client-Version': '1.0.0',
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
    };

    var coreSQL = `SELECT 
                att.id,
                att.fileName,
                att.createDateTime,
                att.type
                FROM Activity act 
                JOIN ServiceCall sc ON sc.id = act.object.objectId
                JOIN Attachment att ON sc.id = att.object.objectId
                WHERE act.id = '`+activity_id+`'`;

    return new Promise(resolve => {

        const result1 =  fetch(`https://${cloudHost}/api/query/v1/?account=${account}&company=${company}&dtos=Attachment.18;Activity.38;Equipment.22;ServiceCall.26`, {
            headers,
            body    : 	JSON.stringify({query: coreSQL}),
            method  :   'POST'
        }) .then(response => response.json())
            .then(function(json) {
                resolve(json.data);
            });


    });
}





// ************************************************************************************************
// Force the client to download an attachment                                                   **
// ************************************************************************************************
function downloadAttachments(cloudHost, account, company, attachment_id) {

    const headers = {
        'Content-Type': 'application/json',
        'X-Client-ID': 'fsm-extension-sample',
        'X-Client-Version': '1.0.0',
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
    };


    return new Promise(resolve => {

         // e.g.: https://de.coresuite.com/api/data/v4/Attachment/88B9D1FC7D2B4AEA8ABE67C638D8F5D3/content?account=hoermann-t1&user=jniemeyer&company=IntHoeMon&dtos=Attachment.16
        const result1 =  fetch(`https://${cloudHost}/api/data/v4/Attachment/`+attachment_id+`/content?account=${account}&company=${company}&dtos=Attachment.16`, {
            headers,
            method  :   'GET'
        }) .then(response => response.arrayBuffer())
            .then(function(buffer) {

                var base64Encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));

                var element = document.createElement('a');
                element.setAttribute('href', 'data:application/pdf;base64,'+base64Encoded);
                element.setAttribute('download', "Attachment.pdf");

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);



            });


    });
}






