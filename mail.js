const imaps = require('imap-simple');
const { convert } = require('html-to-text');
const { READ_MAIL_CONFIG } = require('./config');
const { getClient } = require('./db_client');
//const { getClient } = require('./db_connect');

const getConcreteData = function (data) {
	let concreteData = data.split(',');
	return concreteData[1].trim();
};

const readMail = async () => {
  try {
	console.log('1');
    const connection = await imaps.connect(READ_MAIL_CONFIG);
    console.log('CONNECTION SUCCESSFUL', new Date().toString());
    const box = await connection.openBox('INBOX.Printers_cnt');
    const searchCriteria = ['SEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: false,
    };
    const results = await connection.search(searchCriteria, fetchOptions);
    results.forEach((res) => {
      const text = res.parts.filter((part) => {
        return part.which === 'TEXT';
      });
      let emailHTML = text[0].body;
      let emailText = convert(emailHTML);
	  let emailTextWithoutNewLine = emailText.replace(/(\r\n|\n|\r)/gm, ' ');
	  let splitted_data = emailTextWithoutNewLine.split('[');
	  
	  var val_id = 0;
	  
	  for (let i = 0; i < splitted_data.length; i++) {
	    //console.log(splitted_data[i]);
		if (splitted_data[i].match(/.*Serial.*/)){
			console.log(getConcreteData(splitted_data[i]));
			var serial = getConcreteData(splitted_data[i]);
			
			const info = require("./get_device_info");

			let result = info.getId(serial);
			//result.then((resp) => console.log(`The result is: ${Object.keys(resp)}`));
			console.log(`The result is: ${result}`);
			result.then((resp) => {
				console.log(`The result is: ${resp}`);
				val_id = resp;
				console.log(`ID of device: ${val_id}`);
				console.log(`Serial: ${serial}`);
				console.log(`Date: ${date}`);
				console.log(`Total: ${total}`);
				console.log(`Color: ${color}`);
				console.log(`Black: ${black}`);
				const ss = require("./save_device_stat");
			    ss.saveDeviceStat(date, total, color, black, val_id);
			});
			
			//console.log(`ID of device: ${val_id}`);
			//console.log(`The result is: ${result.value}`)
		}
		if (splitted_data[i].match(/.*Date.*/)){
			console.log(getConcreteData(splitted_data[i]));
			var date = getConcreteData(splitted_data[i]);
		}
		if (splitted_data[i].match(/.*Total Counter.*/)){
			console.log(getConcreteData(splitted_data[i]));
			var total = getConcreteData(splitted_data[i]);
		}
		if (splitted_data[i].match(/.*Total Color Counter.*/)){
			console.log(getConcreteData(splitted_data[i]));
			var color = getConcreteData(splitted_data[i]);
		}
		if (splitted_data[i].match(/.*Total Black Counter.*/)){
			console.log(getConcreteData(splitted_data[i]));
			var black = getConcreteData(splitted_data[i]);
		}
		
		if (i % 12 == 0 && i != 0){
			//const ss = require("./save_device_stat");
			//ss.saveDeviceStat(date, total, color, black, val_id);
			console.log(`Save stats: ${i}`);
		}
	  }
	  //console.log(emailText);
    });
    connection.end();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  readMail,
};