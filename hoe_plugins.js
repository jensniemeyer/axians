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

    var price = data[0].installationPrice.toString()!== "null" ? data[0].installationPrice : " ";
    var curr = data[0].installationPriceCurrency.toString()!== "null" ? data[0].installationPriceCurrency:  " ";
    newLine (detailPanel, "ServiceCall", data[0].sc.code);
    newLine (detailPanel, "Equpimentname", data[0].eq.name);
    newLine (detailPanel, "Installationspreis", price+" "+curr);
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
        downloadAttachments(cloudHost, account, company, id, type, text);
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
function downloadAttachments(cloudHost, account, company, attachment_id, type, fileName) {

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

                //new TextEncoder().encode
                //var base64Encoded = btoa(String.fromCharCode.apply(null, new   TextEncoder().encode(buffer)));
                var base64Encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
                var mime;
                if(type=="PDF")
                    mime = "application/pdf";
                else if(type=="JPG")
                    mime = " image/jpeg";
                else if(type=="PNG")
                    mime = " image/png";


                var element = document.createElement('a');
                element.setAttribute('href', 'data:'+mime+';base64,'+base64Encoded);
                element.setAttribute('download', fileName);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);



            });


    });
}






