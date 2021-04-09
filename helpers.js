// 
// Update html dom with provided string value
//
const updateUI = (text) =>
  (document.querySelectorAll('#info')[0].innerText = text);


const  updateUI_Equipment= (text) =>
  (document.querySelectorAll('#equipment')[0].innerText = text);

const  updateUI_Seriennummer= (text) =>
  (document.querySelectorAll('#seriennummer')[0].innerText = text);

const  updateUI_Attachments = (text) =>
  (document.querySelectorAll('#attachments')[0].innerText = text);


const createAttachmentLink = (url, text) => {
    var a = document.createElement('a');
    var linkText = document.createTextNode(text);
    a.appendChild(linkText);
    a.title = text;
    a.href = url;
    //document.body.appendChild(a);
    return a;
}

const updateUI_DesplayAttachments =(data) => {
    var div =  document.getElementById('attachments');

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    var ul = document.createElement('ul');
    var li;
    div.appendChild(ul);

    for(var i=0;i<data.length;i++) {
        var li = document.createElement('li');
        //li.appendChild(document.createTextNode(data[i].att.fileName));
        var fileName = data[i].att.fileName;
        var link     = data[i].att.fileName;
        li.appendChild(createAttachmentLink(link, fileName));
        ul.appendChild(li);
    }
}


//
// Loop before a token expire to fetch a new one
//
function initializeRefreshTokenStrategy(shellSdk, auth) {

  shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, (event) => {
    sessionStorage.setItem('token', event.access_token);
    setTimeout(() => fetchToken(), (event.expires_in * 1000) - 5000);
  });

  function fetchToken() {
    shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
      response_type: 'token'  // request a user token within the context
    });
  }

  sessionStorage.setItem('token', auth.access_token);
  setTimeout(() => fetchToken(), (auth.expires_in * 1000) - 5000);
}

// 
// Request context with activity ID to return serviceContract assigned
//
function getServiceContract(cloudHost, account, company, activity_id) {
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-ID': 'fsm-extension-sample',
    'X-Client-Version': '1.0.0',
    'Authorization': `bearer ${sessionStorage.getItem('token')}`,
  };

  return new Promise(resolve => {

    // Fetch Activity object
    fetch(`https://${cloudHost}/api/data/v4/Activity/${activity_id}?dtos=Activity.37&account=${account}&company=${company}`, {
      headers
      })
        .then(response => response.json())
        .then(function(json) {

          const activity = json.data[0].activity;
          // Fetch all ServiceContractEquipment
          fetch(`https://${cloudHost}/api/data/v4/ServiceContractEquipment?dtos=ServiceContractEquipment.12&account=${account}&company=${company}`, {
            headers
            })
              .then(response => response.json())
              .then(function(json) {

                const serviceContractEquipment = json.data.find(contract => contract.serviceContractEquipment.equipment === activity.equipment);
                if (!serviceContractEquipment) {
                  resolve(null);
                } else {
                  fetch(`https://${cloudHost}/api/data/v4/ServiceContract/${serviceContractEquipment.serviceContractEquipment.serviceContract}?dtos=ServiceContract.13&account=${account}&company=${company}`, {
                    headers
                    })
                      .then(response => response.json())
                      .then(function(json) {
                        resolve(json.data[0].serviceContract);
                      });
                }

              });

        });

  });
}


// 
// Get the actvity detaisl for planning board
//
function getActivityDetails(cloudHost, account, company, activity_id) {
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-ID': 'fsm-extension-sample',
    'X-Client-Version': '1.0.0',
    'Authorization': `bearer ${sessionStorage.getItem('token')}`,
  };



  return new Promise(resolve => {

    // Fetch Activity object
    fetch(`https://${cloudHost}/api/data/v4/Activity/${activity_id}?dtos=Activity.37&account=${account}&company=${company}`, {
      headers
      })
        .then(response => response.json())
        .then(function(json) {

			const activity = json.data[0].activity;
          
	    		var installationPrice = json.data[0].activity.udfValues[0].value+ " "+ 	json.data[0].activity.udfValues[1].value;
			//resolve(cloudHost+":"+JSON.stringify(json));
	    		resolve(installationPrice);

        });

  });
}

// 
// Get the actvity detaisl for planning board
//
function getEquipmentDetails(cloudHost, account, company, activity_id) {
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-ID': 'fsm-extension-sample',
    'X-Client-Version': '1.0.0',
    'Authorization': `bearer ${sessionStorage.getItem('token')}`,
  };

  return new Promise(resolve => {

    // Fetch Activity object
    fetch(`https://${cloudHost}/api/data/v4/Activity/${activity_id}?dtos=Activity.37&account=${account}&company=${company}`, {
      headers
      })
        .then(response => response.json())
        .then(function(json) {

			const activity = json.data[0].activity;
          
	    		var equipment_id = json.data[0].activity.equipment;
	    
	    		fetch(`https://${cloudHost}/api/data/v4/Equipment/${equipment_id}?dtos=Equipment.22&account=${account}&company=${company}`, {
			      headers
			      })
				.then(response => response.json())
				.then(function(json) {

						//const equi = JSON.stringify(json);
						//resolve (equi);		
				
						var equipment_name = json.data[0].equipment.name;
						var seriennummer   = json.data[0].equipment.serialNumber;
						
	    					resolve([equipment_name, seriennummer]);

				});	
	    

        });

  });
}




// 
// A T T A C H M E N T S
//
function getAttachments(cloudHost, account, company, activity_id) {
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-ID': 'fsm-extension-sample',
    'X-Client-Version': '1.0.0',
    'Authorization': `bearer ${sessionStorage.getItem('token')}`,
  };

  return new Promise(resolve => {

    // Fetch Activity object
    fetch(`https://${cloudHost}/api/data/v4/Activity/${activity_id}?dtos=Activity.37&account=${account}&company=${company}`, {
      headers
      })
        .then(response => response.json())
        .then(function(json) {

			const activity 		= json.data[0].activity;
	    		var serviceCallId	= activity.object.objectId;
         
	    		const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
	    		const coreSQL ='select att.fileName from Attachment att where att.object.objectId =\''+serviceCallId+'\'';

	    		var queryRec = {query: coreSQL};
	    		var body = JSON.stringify(queryRec);
	    		console.info("BODY::::", body);
                                                              // /api/query/v1?&account=scribe&company=Ambit%20AG&dtos=BusinessPartner.17;ServiceCall.17
	    		const result1 =  fetch(`https://${cloudHost}/api/query/v1/?account=${account}&company=${company}&dtos=Attachment.18`, {
				    headers,
                    body : 	 body	 ,
                    method :'POST'
			}) .then(response => response.json())
        		   .then(function(json) {

				   resolve(json.data);
			   });
	    
			
	    
	    });

      

  });
}


