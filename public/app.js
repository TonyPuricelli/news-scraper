// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>" + "<button data-id='" + data[i]._id + "' class='save-article-btn'>SAVE ARTICLE</button>");
    }
  });;
  
// When you click the save article button
$(document).on("click", ".save-article-btn", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("value");
    console.log(thisId);
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/save/" + thisId,
      data: {
        saved: true
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        // $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    // $("#titleinput").val("");
    // $("#bodyinput").val("");
  });

  // Whenever someone clicks a p tag
//   $(document).on("click", "p", function() {
//     // Empty the notes from the note section
//     $("#notes").empty();
//     // Save the id from the p tag
//     var thisId = $(this).attr("data-id");
  
//     // Now make an ajax call for the Article
//     $.ajax({
//       method: "GET",
//       url: "/articles/" + thisId
//     })
//       // With that done, add the note information to the page
//       .then(function(data) {
//         console.log(data);
//         // The title of the article
//         $("#notes").append("<h2>" + data.title + "</h2>");
//         // An input to enter a new title
//         $("#notes").append("<input id='titleinput' name='title' >");
//         // A textarea to add a new note body
//         $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//         // A button to submit a new note, with the id of the article saved to it
//         $("#notes").append("<button data-id='" + data._id + "' id='add-note'>Save Note</button>");
  
//         // If there's a note in the article
//         if (data.note) {
//           // Place the title of the note in the title input
//           $("#titleinput").val(data.note.title);
//           // Place the body of the note in the body textarea
//           $("#bodyinput").val(data.note.body);
//         }
//       });
//   });
  
  // When you click the add note button
  $(document).on("click", "#add-note", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("value");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val().trim(),
        // Value taken from note textarea
        body: $("#bodyinput").val().trim()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  
  // functions to display and hide the note box
  function shownote(event) {
	event.preventDefault();
	var id = $(this).attr("value");
	$("#addnote").fadeIn(300).css("display", "flex");
	$("#add-note").attr("value", id);
	$.get("/" + id, function(data) {
		$("#article-title").text(data.title);
		$.get("/note/" + id, function(data) {
			if (data) {
				$("#note-title").val(data.title);
				$("#note-body").val(data.body);
			}
		});
	});
};

$(document).on("click", ".addnote-button", shownote);
// $(".status").hover(changestatus, changeback);
$("#close-note").on("click", function() {
	$("#addnote").fadeOut(300);
});