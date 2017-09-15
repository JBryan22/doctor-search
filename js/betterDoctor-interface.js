import { BetterDoctor } from './../js/betterDoctor.js';
let apiKey = require('./../.env').apiKey;

let outputDoctors = function(doctorList) {
  (".output").text('');
  (".output").append(`<div class="doctor-info-container"
                      <p class="doc-name">${doctorList[i].firstName} ${doctorList[i].lastName}, ${doctorList[i].title}</p>
                      <p>${outputSpecialties(doctorList[i].specialties)}</p>
                      ${outputAddresses(doctorList[i].addresses)}
                      </div>`)
}

let outputSpecialties = function(specialties) {
  let returnStr = '';
  specialties.forEach(function(specialty) {
    returnStr += specialty + " ";
  });
  return returnStr;
}

let outputAddresses = function(addresses) {
  let returnStr = '';
  addresses.forEach(function(address) {
    returnStr += ("<div class='address-container'>" +
                "<p>" + address.name + "</p>" +
                "<p>" + address.phone + "</p>" +
                "<p>" + address.website + "</p>" +
                "<p>" + address.accepting + "</p>" +
                "<p>" + address.street + "</p>" +
                "<p>" + address.city + ", " + address.state + " " + address.zip + "</p>" +
                "</div>");
  });
  return returnStr;
}

$(function() {
  $("#doctor-search").submit(function(event) {
    event.preventDefault();
    let symptom = $("#symptom-type").val();
    let name = $("#doctor-name").val();
    let doctorList = [];

    let doctorPromise = new Promise(function(resolve, reject) {
        let request = new XMLHttpRequest();
        let url = `https://api.betterdoctor.com/2016-03-01/doctors?location=47.602,-122.3321,15&query=${symptom}&name=${name}&user_key=${apiKey}`;

        request.onload = function() {
          if(this.status === 200) {
            resolve(request.reponse);
          } else {
            reject(Error(request.statusText));
          }
        };
        request.open("GET", url, true);
        request.send();
    });

    doctorPromise.then(function(response) {
      let body = JSON.parse(reponse);

      if (body.data.length < 1) {
        $('.output').text("No results for that search.");
        return;
      }

      for (var i = 0; i < body.length; i++) {
        let firstName = body.data[i].profile.first_name;
        let lastName = body.data[i].profile.last_name;
        let title = body.data[i].profile.title;
        let addresses = [];
        for (var j = 0; j < body.data[j].practices.length; j++) {
          addresses.push({
                        name: body.data[i].practices[j].visit_address.name,
                        phone: body.data[i].practices[j].phones[0].number,
                        website: body.data[i].practices[j].website,
                        street: body.data[i].practices[j].visit_address.street,
                        city: body.data[i].practices[j].visit_address.city,
                        state: body.data[i].practices[j].visit_address.state,
                        zip: body.data[i].practices[j].visit_address.zip,
                        accepting: body.data[i].practices[j].accepts_new_patients
                      });
        }
        let image = body.data[i].profile.image_url;
        let specialties = [];
        for (j = 0; j < body.data[i].specialties.length; j++) {
          specialties.push(body.data[i].specialties[0].name);
        }
        let uid = body.data[i].uid;

        let newDoctor = new Doctor(firstName, lastName, addresses, phone, image, specialties, uid);
        doctorList.push(newDoctor);

        outputDoctors(doctorList);
      }

    }, function(error) {
      $(".output").text(`There was an error! ${error.message}`);
    });

  });
});
