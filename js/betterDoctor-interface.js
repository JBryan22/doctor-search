import { Doctor } from './../js/doctor.js';
let apiKey = require('./../.env').apiKey;

let outputDoctors = function(doctorList) {
  $(".output").text('');
  doctorList.forEach(function(doctor) {
    $(".output").append(`<div class="doctor-info-container">
                        <p class="doc-name">${doctor.firstName} ${doctor.lastName}, ${doctor.title}</p>
                        <p class="special"></span> ${outputSpecialties(doctor.specialties)}</p>
                        <div class="image-container">
                          <img src=${doctor.image}>
                        </div>

                        ${outputAddresses(doctor.addresses)}
                        </div>`);
  });
};

let outputSpecialties = function(specialties) {
  let returnStr = '';
  specialties.forEach(function(specialty) {
    returnStr += specialty + ", ";

  });
  let i = returnStr.lastIndexOf(',');
  if (i != -1) {
    returnStr = returnStr.substr(0, i) + returnStr.substr(i + 1);
  }
  return returnStr;
};

let outputAddresses = function(addresses) {
  let returnStr = "<div class=first-address>" +
                    "<div class='middle'>" +
                    "<p class='details'><span class='title'>Practice name:</span> " + addresses[0].name + "</p>" +
                    "<p class='details'><span class='title'>Phone:</span> " + addresses[0].phone + "</p>" +
                    (addresses[0].website ? ("<p><a href='" + addresses[0].website + "'>" + addresses[0].website + "</a></p>") : "") +
                    "<p class='details'><span class='title'>Accepting New Patients:</span> " + (addresses[0].accepting ? "Yes" : "No") + "</p>" +
                    "</div>" +
                    "<div class='right'>" +
                    "<p>" + addresses[0].street + "</p>" +
                    "<p>" + addresses[0].city + ", " + addresses[0].state + " " + addresses[0].zip + "</p>" +
                    (addresses.length > 1 ? "<p class='additional'>Toggle Additional Practices</p>" : "") +
                    "</div>" +
                  "</div>";
    returnStr += "<div class='outer-extra-address-container'>";
  for (let i = 1; i < addresses.length; i++) {

    returnStr += ("<div class=address-container>" +
                    "<div class='middle'>" +
                    "<p class='details'><span class='title'>Practice name:</span> " + addresses[i].name + "</p>" +
                    "<p class='details'><span class='title'>Phone:</span> " + addresses[i].phone + "</p>" +
                    (addresses[i].website ? ("<p><a href='" + addresses[i].website + "'>" + addresses[i].website + "</a></p>") : "") +
                    "<p class='details'><span class='title'>Accepting New Patients:</span> " + (addresses[i].accepting ? "Yes" : "No") + "</p>" +
                    "</div>" +
                    "<div class='right'>" +
                    "<p>" + addresses[i].street + "</p>" +
                    "<p>" + addresses[i].city + ", " + addresses[i].state + " " + addresses[i].zip + "</p>" +
                    "</div>" +
                  "</div>");

  }
      returnStr += "</div>"
  // addresses.forEach(function(address) {
  //   returnStr += ("<div class='address-container'>" +
  //               "<p>" + address.name + "</p>" +
  //               "<p>" + address.phone + "</p>" +
  //               (address.website ? ("<p>" + address.website + "</p>") : "") +
  //               "<p>Accepting new patients: " + address.accepting + "</p>" +
  //               "<p>" + address.street + "</p>" +
  //               "<p>" + address.city + ", " + address.state + " " + address.zip + "</p>" +
  //               "</div>");
  // });
  return returnStr;
};

$(function() {
  $("#doctor-search").submit(function(event) {
    event.preventDefault();
    let symptom = $("#symptom-type").val();
    $("#symptom-type").val('')
    let name = $("#doctor-name").val();
    $("#doctor-name").val('');
    let doctorList = [];

    let doctorPromise = new Promise(function(resolve, reject) {
        let request = new XMLHttpRequest();
        let url = `https://api.betterdoctor.com/2016-03-01/doctors?location=47.602,-122.3321,15&query=${symptom}&name=${name}&user_key=${apiKey}`;

        request.onload = function() {
          if(this.status === 200) {
            resolve(request.response);
          } else {
            reject(Error(request.statusText));
          }
        };
        request.open("GET", url, true);
        request.send();
    });

    doctorPromise.then(function(response) {
      let body = JSON.parse(response);
      console.log(body.data);
      if (body.data.length < 1) {
        $('.output').text("No results for that search.");
        return;
      }

      for (var i = 0; i < body.data.length; i++) {
        let firstName = body.data[i].profile.first_name;
        let lastName = body.data[i].profile.last_name;
        let title = body.data[i].profile.title;
        let addresses = [];
        for (var j = 0; j < body.data[i].practices.length; j++) {
          addresses.push({
                        name: body.data[i].practices[j].name,
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
        console.log("special" + body.data[i].specialties[0].name);
        for (let k = 0; k < body.data[i].specialties.length; k++) {
          specialties.push(body.data[i].specialties[k].name);
        }
        let uid = body.data[i].uid;

        let newDoctor = new Doctor(firstName, lastName, title, addresses, image, specialties, uid);
        doctorList.push(newDoctor);

        outputDoctors(doctorList);

        $(".additional").click(function() {
          $(this).parent().parent().next().toggle();
        })

      }

    }, function(error) {
      $(".output").text(`There was an error! ${error.message}`);
    });

  });
});
