function init() {
  document.getElementById("filter_box").value = "";
}

$(document).ready(init);

var custom_cookie;

document.addEventListener('DOMContentLoaded', function() {
  var custom_cookie = Cookies.get('location');
    // Cookies.set('location', $('#location_selector').val(), { expires: 365 });
  if (!custom_cookie) {
    return;
  }
}, false);

function filter_results() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("filter_box");
  filter = input.value.toUpperCase();
  table = document.getElementById("regional_table");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td1 = tr[i].getElementsByTagName("td")[0];
    td2 = tr[i].getElementsByTagName("td")[1];
    td3 = tr[i].getElementsByTagName("td")[2];
    if (td1 && td2 && td3) {
      if (td1.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].classList.remove("hidden");
        if (!tr[i].classList.contains("found")) {
          tr[i].className += " found";
        }

      } else if (td2.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].classList.remove("hidden");
        if (!tr[i].classList.contains("found")) {
          tr[i].className += " found";
        }
      } else if (td3.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].classList.remove("hidden");
        if (!tr[i].classList.contains("found")) {
          tr[i].className += " found";
        }
      } else {
        if (!tr[i].classList.contains("hidden")) {
          tr[i].className += " hidden";
        }
        tr[i].classList.remove("found");
      }
    }
  }
  
  $("#regional_table").removeClass("w3-striped");
  
  $("#regional_table tr:not(.hidden)").not("thead tr").each(function (index) {
      $(this).toggleClass("stripe", !!(index & 1));
  });
  
}

function startup() {
  $('#regional_details').hide();
}

$(function() {
  $('#home_button').on('click', function() {
    $('#regional_details').hide();
    $('#regional_list').show();
  });
  
  $('#questions_button').on('click', function() {
    $("#questions_alert").show();
  });

  $('#regional_table tr').not(':first').each(function(index, element) {
      $(element).on('click', function() {
          var name = $(element).find('.table_entry_name').attr('id');
          var location = $(element).find('.table_entry_location').attr('id');
          var week = $(element).find('.table_entry_week').attr('id');
      });
  });

});