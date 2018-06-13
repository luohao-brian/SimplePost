/**
 * Created by Kupletsky Sergey on 17.10.14.
 *
 * Material Sidebar (Profile menu)
 * Tested on Win8.1 with browsers: Chrome 37, Firefox 32, Opera 25, IE 11, Safari 5.1.7
 * You can use this sidebar in Bootstrap (v3) projects. HTML-markup like Navbar bootstrap component will make your work easier.
 * Dropdown menu and sidebar toggle button works with JQuery and Bootstrap.min.js
 */

// Sidebar toggle
//
// -------------------
$(document).ready(function() {
    var overlay = $('.sidebar-overlay');

    $('.sidebar-toggle').on('click', function() {
        var sidebar = $('#sidebar');
        sidebar.toggleClass('open');
        if ((sidebar.hasClass('sidebar-fixed-left') || sidebar.hasClass('sidebar-fixed-right')) && sidebar.hasClass('open')) {
            overlay.addClass('active');
        } else {
            overlay.removeClass('active');
        }
    });

    overlay.on('click', function() {
        $(this).removeClass('active');
        $('#sidebar').removeClass('open');
    });

});

// Sidebar constructor
//
// -------------------
$(document).ready(function() {

    var sidebar = $('#sidebar');
    var sidebarHeader = $('#sidebar .sidebar-header');
    var sidebarImg = sidebarHeader.css('background-image');
    var toggleButtons = $('.sidebar-toggle');

    // Hide toggle buttons on default position
    toggleButtons.css('display', 'none');
    $('body').css('display', 'table');


    // Sidebar position
    $('#sidebar-position').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-fixed-left sidebar-fixed-right sidebar-stacked').addClass(value).addClass('open');
        if (value == 'sidebar-fixed-left' || value == 'sidebar-fixed-right') {
            $('.sidebar-overlay').addClass('active');
        }
        // Show toggle buttons
        if (value != '') {
            toggleButtons.css('display', 'initial');
            $('body').css('display', 'initial');
        } else {
            // Hide toggle buttons
            toggleButtons.css('display', 'none');
            $('body').css('display', 'table');
        }
    });

    // Sidebar theme
    $('#sidebar-theme').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-default sidebar-inverse sidebar-colored sidebar-colored-inverse').addClass(value)
    });

    // Header cover
    $('#sidebar-header').change(function() {
        var value = $(this).val();

        $('.sidebar-header').removeClass('header-cover').addClass(value);

        if (value == 'header-cover') {
            sidebarHeader.css('background-image', sidebarImg)
        } else {
            sidebarHeader.css('background-image', '')
        }
    });
});

/**
 * Created by Kupletsky Sergey on 08.09.14.
 *
 * Add JQuery animation to bootstrap dropdown elements.
 */

(function($) {
    var dropdown = $('.dropdown');

    // Add slidedown animation to dropdown
    dropdown.on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    // Add slideup animation to dropdown
    dropdown.on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });
})(jQuery);



(function(removeClass) {

	jQuery.fn.removeClass = function( value ) {
		if ( value && typeof value.test === "function" ) {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];
				if ( elem.nodeType === 1 && elem.className ) {
					var classNames = elem.className.split( /\s+/ );

					for ( var n = classNames.length; n--; ) {
						if ( value.test(classNames[n]) ) {
							classNames.splice(n, 1);
						}
					}
					elem.className = jQuery.trim( classNames.join(" ") );
				}
			}
		} else {
			removeClass.call(this, value);
		}
		return this;
	}

})(jQuery.fn.removeClass);

$(function () {
    $('.comment-delete').on("click", function () {
        var comment = $(this);
        alertify.confirm("Are you sure you want to delete this post?", function() {
            var id = comment.attr("rel");
            $.ajax({
                type: "delete",
                url: "/admin/comments/?id=" + id,
                success: function (json) {
                    alertify.success("Comment delted");
                    $('#comment-' + id).remove();
                },
                error: function (json) {
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            });
        });
    });
    $('.comment-approve').on("click", function () {
        var comment = $(this);
        var id = $(this).attr("rel");
        $.ajax({
            type: "put",
            url: "/admin/comments/?id=" + id,
            "success":function(json){
                if(json.status === "success"){
                    alertify.success("Comment approved");
                    comment.removeClass("comment-approve").removeClass("mdl-color-text--green").addClass("disabled").attr("disabled", true);
                    comment.unbind();
                }else{
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            }
        });
        return false;
    });
    $('.comment-reply').on("click",function(){
        var id = $(this).attr("rel");
        $('#comment-'+id).after($('#comment-block').detach().show());
        $('#comment-parent').val(id);
        return false;
    });
    $('#comment-form').ajaxForm({
        success: function (json) {
            alertify.success("Succesfully replied");
            window.location.href = "/admin/comments/";
        },
        error: function (json) {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $('#comment-close').on("click",function(){
        $('#comment-block').hide();
        $('#comment-parent').val(0);
        $('#comment-content').val("");
    });
});

$(function () {
  new FormValidator("post-form", [
      {"name": "slug", "rules": "alpha_dash"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }
    $('#post-form').ajaxSubmit({
    success: function (json) {
      if (json.status === "success") {
        alertify.success("Content saved", 'success');
        window.history.pushState({}, "", "/admin/editor/" + json.content.Id + "/");
      } else {
        alertify.error(json.msg);
      }
    },
    error: function (json) {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
    }
    });
  });
  initUpload("#post-information");
});

$(function () {
  $("#files_table").on("click", '.delete-file', function(e){
    e.preventDefault();
    
    var me = $(this);
    var name = me.attr("name");
    var path = me.attr("rel");
    
    alertify.confirm("Are you sure you want to delete this file?", function() {
      $.ajax({
        "type": "delete",
        "url": "/admin/files/?path=" + path,
        "success": function (json) {
          if(json.status === "success"){
            me.parent().parent().remove();
            alertify.success("File deleted");
          }else{
            alert(json.msg);
          }
        }
      });
    });
  });
});

$(function () {
  new FormValidator("login-form", [
      {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }

    $('#login-form').ajaxSubmit({
      dataType: "json",
      success: function (json) {
        if (json.status === "error") {
          alertify.error("Incorrect username & password combination.");
        } else {
          window.location.href = "/admin/";
        }
      }
    });
  })
});

$(function(){
  new FormValidator("password-form",[
      {"name":"old","rules":"min_length[2]|max_length[20]"},
      {"name":"new","rules":"min_length[2]|max_length[20]"},
      {"name":"confirm","rules":"required|matches[new]"}
  ],function(errors,e){
    e.preventDefault();
    $('.invalid').hide();
    if(errors.length){
      $("#"+errors[0].id+"-invalid").removeClass("hide").show();
      return;
    }
    $('#password').ajaxSubmit({
      "success": function() {
        alertify.success("Password changed");
      },
      "error": function() {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
      }
    });
  })
});

$(".delete-post").on("click",function(e){
  e.preventDefault();
  var id = $(this).attr("rel");
  alertify.confirm("Are you sure you want to delete this post?", function() {
    $.ajax({
      "url":"/admin/editor/"+id+"/",
      "type":"delete",
      "success":function(json){
        if(json.status === "success"){
          alertify.success("Post deleted");
          $('#dingo-post-' + id).remove();
        }else{
          alertify.error((JSON.parse(json.responseText).msg));
        }
      }
    });
  });
});


$(function(){
    new FormValidator("profile-form",[
        {"name":"slug","rules":"alpha_numeric|min_length[1]|max_length[20]"},
        {"name":"email","rules":"valid_email"},
        {"name":"url","rules":"valid_url"}
    ],function(errors,e) {
        e.preventDefault();
        $('.invalid').hide();
        if(errors.length){
            $("#"+errors[0].id+"-invalid").removeClass("hide").show();
            return;
        }
        $('#profile').ajaxSubmit(function(json){
            if(json.status === "error"){
                alert(json.msg);
            }else{
                alertify.success("Profile saved")
            }
            return false;
        });
    })
});

$(function () {
    $('.setting-form').ajaxForm({
        'success': function() {
            alertify.success("Saved");
        },
        'error': function() {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $("#add-custom").on("click", function(e) {
        e.preventDefault();
        $("#custom-settings").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();
    });
    $("#add-nav").on("click", function(e) {
        e.preventDefault();
        $("#navigators").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();

    });
    $('.setting-form').on("click", ".del-nav", function(e) {
        e.preventDefault();
        console.log($(this).parent().parent());
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
    $('.setting-form').on("click", ".del-custom", function(e) {
        e.preventDefault();
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
})

$(function () {
    new FormValidator("signup-form", [
        {"name": "name", "rules": "required"},
        {"name": "email", "rules": "required"},
        {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
    ], function (errors, e) {
        e.preventDefault();
        if (errors.length) {
            alertify.error("Error: " + errors[0].message);
            return;
        }
        $('#signup-form').ajaxSubmit({
            success: function (json) {
                window.location.href = "/admin/";
            },
            error: function (json) {
                alertify.error(("Error: " + JSON.parse(json.responseText).msg));
            }
        });
    })
});

function editorAction(json) {
    var cm = $('.CodeMirror')[0].CodeMirror;
    var doc = cm.getDoc();
    doc.replaceSelections(["![](/" + json.file.url + ")"]);
}

function filesAction(json) {
    var $fileLine = $('<tr id="file-' + json.file.name + '">' 
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.time + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.size + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.name + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.type + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">'
          + '<a class="btn btn-small blue" href="/'+ json.file.url +'" target="_blank" title="/' + json.file.name + '">View</a>&nbsp;'
          + '<a class="btn btn-small red delete-file" href="#" name="' + json.file.name + '" rel="' + json.file.url + '" title="Delete">Delete</a>'
        + '</td></tr>');
    $('tbody').append($fileLine);
}

function initUpload(p) {
    $('#attach-show').on("click", function() {
        $('#attach-upload').trigger("click");
    });
    $('#attach-upload').on("change", function () {
        alertify.confirm("Upload now?", function() {
            var bar = $('<p class="file-progress inline-block">0%</p>');
            $('#attach-form').ajaxSubmit({
                "beforeSubmit": function () {
                    $(p).before(bar);
                },
                "uploadProgress": function (event, position, total, percentComplete) {
                    var percentVal = percentComplete + '%';
                    bar.css("width", percentVal).html(percentVal);
                },
                "success": function (json) {
                    $('#attach-upload').val("");
                    if (json.status === "error") {
                        bar.html(json.msg).addClass("err");
                        setTimeout(function () {
                            bar.remove();
                        }, 5000);
                        return
                    }
                    
                    alertify.success("File has been uploaded.")
                    bar.html("/" + json.file.url + "&nbsp;&nbsp;&nbsp;(@" + json.file.name + ")");
                    
                    if ($('.CodeMirror').length == 0) {
                        filesAction(json);
                    } else {
                        editorAction(json);
                    }
                }
            });
        }, function() {
            $(this).val("");
        });
    });
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbW1lbnRzLmpzIiwiZWRpdG9yLmpzIiwiZmlsZXMuanMiLCJsb2dpbi5qcyIsInBhc3N3b3JkLmpzIiwicG9zdHMuanMiLCJwcm9maWxlLmpzIiwic2V0dGluZ3MuanMiLCJzaWdudXAuanMiLCJ1cGxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBLdXBsZXRza3kgU2VyZ2V5IG9uIDE3LjEwLjE0LlxuICpcbiAqIE1hdGVyaWFsIFNpZGViYXIgKFByb2ZpbGUgbWVudSlcbiAqIFRlc3RlZCBvbiBXaW44LjEgd2l0aCBicm93c2VyczogQ2hyb21lIDM3LCBGaXJlZm94IDMyLCBPcGVyYSAyNSwgSUUgMTEsIFNhZmFyaSA1LjEuN1xuICogWW91IGNhbiB1c2UgdGhpcyBzaWRlYmFyIGluIEJvb3RzdHJhcCAodjMpIHByb2plY3RzLiBIVE1MLW1hcmt1cCBsaWtlIE5hdmJhciBib290c3RyYXAgY29tcG9uZW50IHdpbGwgbWFrZSB5b3VyIHdvcmsgZWFzaWVyLlxuICogRHJvcGRvd24gbWVudSBhbmQgc2lkZWJhciB0b2dnbGUgYnV0dG9uIHdvcmtzIHdpdGggSlF1ZXJ5IGFuZCBCb290c3RyYXAubWluLmpzXG4gKi9cblxuLy8gU2lkZWJhciB0b2dnbGVcbi8vXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICB2YXIgb3ZlcmxheSA9ICQoJy5zaWRlYmFyLW92ZXJsYXknKTtcblxuICAgICQoJy5zaWRlYmFyLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2lkZWJhciA9ICQoJyNzaWRlYmFyJyk7XG4gICAgICAgIHNpZGViYXIudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgaWYgKChzaWRlYmFyLmhhc0NsYXNzKCdzaWRlYmFyLWZpeGVkLWxlZnQnKSB8fCBzaWRlYmFyLmhhc0NsYXNzKCdzaWRlYmFyLWZpeGVkLXJpZ2h0JykpICYmIHNpZGViYXIuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAgICAgb3ZlcmxheS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdmVybGF5LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJyNzaWRlYmFyJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9KTtcblxufSk7XG5cbi8vIFNpZGViYXIgY29uc3RydWN0b3Jcbi8vXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgIHZhciBzaWRlYmFyID0gJCgnI3NpZGViYXInKTtcbiAgICB2YXIgc2lkZWJhckhlYWRlciA9ICQoJyNzaWRlYmFyIC5zaWRlYmFyLWhlYWRlcicpO1xuICAgIHZhciBzaWRlYmFySW1nID0gc2lkZWJhckhlYWRlci5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcbiAgICB2YXIgdG9nZ2xlQnV0dG9ucyA9ICQoJy5zaWRlYmFyLXRvZ2dsZScpO1xuXG4gICAgLy8gSGlkZSB0b2dnbGUgYnV0dG9ucyBvbiBkZWZhdWx0IHBvc2l0aW9uXG4gICAgdG9nZ2xlQnV0dG9ucy5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAndGFibGUnKTtcblxuXG4gICAgLy8gU2lkZWJhciBwb3NpdGlvblxuICAgICQoJyNzaWRlYmFyLXBvc2l0aW9uJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKCB0aGlzICkudmFsKCk7XG4gICAgICAgIHNpZGViYXIucmVtb3ZlQ2xhc3MoJ3NpZGViYXItZml4ZWQtbGVmdCBzaWRlYmFyLWZpeGVkLXJpZ2h0IHNpZGViYXItc3RhY2tlZCcpLmFkZENsYXNzKHZhbHVlKS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICBpZiAodmFsdWUgPT0gJ3NpZGViYXItZml4ZWQtbGVmdCcgfHwgdmFsdWUgPT0gJ3NpZGViYXItZml4ZWQtcmlnaHQnKSB7XG4gICAgICAgICAgICAkKCcuc2lkZWJhci1vdmVybGF5JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNob3cgdG9nZ2xlIGJ1dHRvbnNcbiAgICAgICAgaWYgKHZhbHVlICE9ICcnKSB7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b25zLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgICAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ2luaXRpYWwnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEhpZGUgdG9nZ2xlIGJ1dHRvbnNcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbnMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAndGFibGUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU2lkZWJhciB0aGVtZVxuICAgICQoJyNzaWRlYmFyLXRoZW1lJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKCB0aGlzICkudmFsKCk7XG4gICAgICAgIHNpZGViYXIucmVtb3ZlQ2xhc3MoJ3NpZGViYXItZGVmYXVsdCBzaWRlYmFyLWludmVyc2Ugc2lkZWJhci1jb2xvcmVkIHNpZGViYXItY29sb3JlZC1pbnZlcnNlJykuYWRkQ2xhc3ModmFsdWUpXG4gICAgfSk7XG5cbiAgICAvLyBIZWFkZXIgY292ZXJcbiAgICAkKCcjc2lkZWJhci1oZWFkZXInKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykudmFsKCk7XG5cbiAgICAgICAgJCgnLnNpZGViYXItaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1jb3ZlcicpLmFkZENsYXNzKHZhbHVlKTtcblxuICAgICAgICBpZiAodmFsdWUgPT0gJ2hlYWRlci1jb3ZlcicpIHtcbiAgICAgICAgICAgIHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgc2lkZWJhckltZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJycpXG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIENyZWF0ZWQgYnkgS3VwbGV0c2t5IFNlcmdleSBvbiAwOC4wOS4xNC5cbiAqXG4gKiBBZGQgSlF1ZXJ5IGFuaW1hdGlvbiB0byBib290c3RyYXAgZHJvcGRvd24gZWxlbWVudHMuXG4gKi9cblxuKGZ1bmN0aW9uKCQpIHtcbiAgICB2YXIgZHJvcGRvd24gPSAkKCcuZHJvcGRvd24nKTtcblxuICAgIC8vIEFkZCBzbGlkZWRvd24gYW5pbWF0aW9uIHRvIGRyb3Bkb3duXG4gICAgZHJvcGRvd24ub24oJ3Nob3cuYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5zbGlkZURvd24oKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBzbGlkZXVwIGFuaW1hdGlvbiB0byBkcm9wZG93blxuICAgIGRyb3Bkb3duLm9uKCdoaWRlLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuc2xpZGVVcCgpO1xuICAgIH0pO1xufSkoalF1ZXJ5KTtcblxuXG5cbihmdW5jdGlvbihyZW1vdmVDbGFzcykge1xuXG5cdGpRdWVyeS5mbi5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRpZiAoIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50ZXN0ID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdFx0dmFyIGVsZW0gPSB0aGlzW2ldO1xuXHRcdFx0XHRpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgJiYgZWxlbS5jbGFzc05hbWUgKSB7XG5cdFx0XHRcdFx0dmFyIGNsYXNzTmFtZXMgPSBlbGVtLmNsYXNzTmFtZS5zcGxpdCggL1xccysvICk7XG5cblx0XHRcdFx0XHRmb3IgKCB2YXIgbiA9IGNsYXNzTmFtZXMubGVuZ3RoOyBuLS07ICkge1xuXHRcdFx0XHRcdFx0aWYgKCB2YWx1ZS50ZXN0KGNsYXNzTmFtZXNbbl0pICkge1xuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWVzLnNwbGljZShuLCAxKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxlbS5jbGFzc05hbWUgPSBqUXVlcnkudHJpbSggY2xhc3NOYW1lcy5qb2luKFwiIFwiKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZUNsYXNzLmNhbGwodGhpcywgdmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59KShqUXVlcnkuZm4ucmVtb3ZlQ2xhc3MpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnLmNvbW1lbnQtZGVsZXRlJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb21tZW50ID0gJCh0aGlzKTtcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBwb3N0P1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IGNvbW1lbnQuYXR0cihcInJlbFwiKTtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJkZWxldGVcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FkbWluL2NvbW1lbnRzLz9pZD1cIiArIGlkLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb21tZW50IGRlbHRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2NvbW1lbnQtJyArIGlkKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgJCgnLmNvbW1lbnQtYXBwcm92ZScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29tbWVudCA9ICQodGhpcyk7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHR5cGU6IFwicHV0XCIsXG4gICAgICAgICAgICB1cmw6IFwiL2FkbWluL2NvbW1lbnRzLz9pZD1cIiArIGlkLFxuICAgICAgICAgICAgXCJzdWNjZXNzXCI6ZnVuY3Rpb24oanNvbil7XG4gICAgICAgICAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkNvbW1lbnQgYXBwcm92ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQucmVtb3ZlQ2xhc3MoXCJjb21tZW50LWFwcHJvdmVcIikucmVtb3ZlQ2xhc3MoXCJtZGwtY29sb3ItdGV4dC0tZ3JlZW5cIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQudW5iaW5kKCk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCcuY29tbWVudC1yZXBseScpLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gICAgICAgICQoJyNjb21tZW50LScraWQpLmFmdGVyKCQoJyNjb21tZW50LWJsb2NrJykuZGV0YWNoKCkuc2hvdygpKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtcGFyZW50JykudmFsKGlkKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICQoJyNjb21tZW50LWZvcm0nKS5hamF4Rm9ybSh7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiU3VjY2VzZnVsbHkgcmVwbGllZFwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vY29tbWVudHMvXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKCcjY29tbWVudC1jbG9zZScpLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe1xuICAgICAgICAkKCcjY29tbWVudC1ibG9jaycpLmhpZGUoKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtcGFyZW50JykudmFsKDApO1xuICAgICAgICAkKCcjY29tbWVudC1jb250ZW50JykudmFsKFwiXCIpO1xuICAgIH0pO1xufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgbmV3IEZvcm1WYWxpZGF0b3IoXCJwb3N0LWZvcm1cIiwgW1xuICAgICAge1wibmFtZVwiOiBcInNsdWdcIiwgXCJydWxlc1wiOiBcImFscGhhX2Rhc2hcIn1cbiAgXSwgZnVuY3Rpb24gKGVycm9ycywgZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgJChcIiNcIiArIGVycm9yc1swXS5pZCArIFwiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJCgnI3Bvc3QtZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKSB7XG4gICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb250ZW50IHNhdmVkXCIsICdzdWNjZXNzJyk7XG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJcIiwgXCIvYWRtaW4vZWRpdG9yL1wiICsganNvbi5jb250ZW50LklkICsgXCIvXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnRpZnkuZXJyb3IoanNvbi5tc2cpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIGluaXRVcGxvYWQoXCIjcG9zdC1pbmZvcm1hdGlvblwiKTtcbn0pO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICQoXCIjZmlsZXNfdGFibGVcIikub24oXCJjbGlja1wiLCAnLmRlbGV0ZS1maWxlJywgZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFxuICAgIHZhciBtZSA9ICQodGhpcyk7XG4gICAgdmFyIG5hbWUgPSBtZS5hdHRyKFwibmFtZVwiKTtcbiAgICB2YXIgcGF0aCA9IG1lLmF0dHIoXCJyZWxcIik7XG4gICAgXG4gICAgYWxlcnRpZnkuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBmaWxlP1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIFwidHlwZVwiOiBcImRlbGV0ZVwiLFxuICAgICAgICBcInVybFwiOiBcIi9hZG1pbi9maWxlcy8/cGF0aD1cIiArIHBhdGgsXG4gICAgICAgIFwic3VjY2Vzc1wiOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgIGlmKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIil7XG4gICAgICAgICAgICBtZS5wYXJlbnQoKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJGaWxlIGRlbGV0ZWRcIik7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBhbGVydChqc29uLm1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICBuZXcgRm9ybVZhbGlkYXRvcihcImxvZ2luLWZvcm1cIiwgW1xuICAgICAge1wibmFtZVwiOiBcInBhc3N3b3JkXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZHxtaW5fbGVuZ3RoWzRdfG1heF9sZW5ndGhbMjBdXCJ9XG4gIF0sIGZ1bmN0aW9uIChlcnJvcnMsIGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICQoXCIjXCIgKyBlcnJvcnNbMF0uaWQgKyBcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJCgnI2xvZ2luLWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIGlmIChqc29uLnN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XG4gICAgICAgICAgYWxlcnRpZnkuZXJyb3IoXCJJbmNvcnJlY3QgdXNlcm5hbWUgJiBwYXNzd29yZCBjb21iaW5hdGlvbi5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hZG1pbi9cIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxufSk7XG4iLCIkKGZ1bmN0aW9uKCl7XG4gIG5ldyBGb3JtVmFsaWRhdG9yKFwicGFzc3dvcmQtZm9ybVwiLFtcbiAgICAgIHtcIm5hbWVcIjpcIm9sZFwiLFwicnVsZXNcIjpcIm1pbl9sZW5ndGhbMl18bWF4X2xlbmd0aFsyMF1cIn0sXG4gICAgICB7XCJuYW1lXCI6XCJuZXdcIixcInJ1bGVzXCI6XCJtaW5fbGVuZ3RoWzJdfG1heF9sZW5ndGhbMjBdXCJ9LFxuICAgICAge1wibmFtZVwiOlwiY29uZmlybVwiLFwicnVsZXNcIjpcInJlcXVpcmVkfG1hdGNoZXNbbmV3XVwifVxuICBdLGZ1bmN0aW9uKGVycm9ycyxlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgaWYoZXJyb3JzLmxlbmd0aCl7XG4gICAgICAkKFwiI1wiK2Vycm9yc1swXS5pZCtcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICQoJyNwYXNzd29yZCcpLmFqYXhTdWJtaXQoe1xuICAgICAgXCJzdWNjZXNzXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiUGFzc3dvcmQgY2hhbmdlZFwiKTtcbiAgICAgIH0sXG4gICAgICBcImVycm9yXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn0pO1xuIiwiJChcIi5kZWxldGUtcG9zdFwiKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKFwicmVsXCIpO1xuICBhbGVydGlmeS5jb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIHBvc3Q/XCIsIGZ1bmN0aW9uKCkge1xuICAgICQuYWpheCh7XG4gICAgICBcInVybFwiOlwiL2FkbWluL2VkaXRvci9cIitpZCtcIi9cIixcbiAgICAgIFwidHlwZVwiOlwiZGVsZXRlXCIsXG4gICAgICBcInN1Y2Nlc3NcIjpmdW5jdGlvbihqc29uKXtcbiAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiUG9zdCBkZWxldGVkXCIpO1xuICAgICAgICAgICQoJyNkaW5nby1wb3N0LScgKyBpZCkucmVtb3ZlKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4iLCIkKGZ1bmN0aW9uKCl7XG4gICAgbmV3IEZvcm1WYWxpZGF0b3IoXCJwcm9maWxlLWZvcm1cIixbXG4gICAgICAgIHtcIm5hbWVcIjpcInNsdWdcIixcInJ1bGVzXCI6XCJhbHBoYV9udW1lcmljfG1pbl9sZW5ndGhbMV18bWF4X2xlbmd0aFsyMF1cIn0sXG4gICAgICAgIHtcIm5hbWVcIjpcImVtYWlsXCIsXCJydWxlc1wiOlwidmFsaWRfZW1haWxcIn0sXG4gICAgICAgIHtcIm5hbWVcIjpcInVybFwiLFwicnVsZXNcIjpcInZhbGlkX3VybFwifVxuICAgIF0sZnVuY3Rpb24oZXJyb3JzLGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICAgICAgaWYoZXJyb3JzLmxlbmd0aCl7XG4gICAgICAgICAgICAkKFwiI1wiK2Vycm9yc1swXS5pZCtcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJCgnI3Byb2ZpbGUnKS5hamF4U3VibWl0KGZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwiZXJyb3JcIil7XG4gICAgICAgICAgICAgICAgYWxlcnQoanNvbi5tc2cpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlByb2ZpbGUgc2F2ZWRcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfSlcbn0pO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLmFqYXhGb3JtKHtcbiAgICAgICAgJ3N1Y2Nlc3MnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJTYXZlZFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ2Vycm9yJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoXCIjYWRkLWN1c3RvbVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKFwiI2N1c3RvbS1zZXR0aW5nc1wiKS5hcHBlbmQoJCgkKHRoaXMpLmF0dHIoXCJyZWxcIikpLmh0bWwoKSk7XG4gICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuICAgIH0pO1xuICAgICQoXCIjYWRkLW5hdlwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKFwiI25hdmlnYXRvcnNcIikuYXBwZW5kKCQoJCh0aGlzKS5hdHRyKFwicmVsXCIpKS5odG1sKCkpO1xuICAgICAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVEb20oKTtcblxuICAgIH0pO1xuICAgICQoJy5zZXR0aW5nLWZvcm0nKS5vbihcImNsaWNrXCIsIFwiLmRlbC1uYXZcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCQodGhpcykucGFyZW50KCkucGFyZW50KCkpO1xuICAgICAgICB2YXIgaXRlbSA9ICQodGhpcykucGFyZW50KCkucGFyZW50KClcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkRlbGV0ZSB0aGlzIGl0ZW0/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLm9uKFwiY2xpY2tcIiwgXCIuZGVsLWN1c3RvbVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGl0ZW0gPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpXG4gICAgICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJEZWxldGUgdGhpcyBpdGVtP1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSlcbiIsIiQoZnVuY3Rpb24gKCkge1xuICAgIG5ldyBGb3JtVmFsaWRhdG9yKFwic2lnbnVwLWZvcm1cIiwgW1xuICAgICAgICB7XCJuYW1lXCI6IFwibmFtZVwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWRcIn0sXG4gICAgICAgIHtcIm5hbWVcIjogXCJlbWFpbFwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWRcIn0sXG4gICAgICAgIHtcIm5hbWVcIjogXCJwYXNzd29yZFwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWR8bWluX2xlbmd0aFs0XXxtYXhfbGVuZ3RoWzIwXVwifVxuICAgIF0sIGZ1bmN0aW9uIChlcnJvcnMsIGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoXCJFcnJvcjogXCIgKyBlcnJvcnNbMF0ubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJCgnI3NpZ251cC1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pXG59KTtcbiIsImZ1bmN0aW9uIGVkaXRvckFjdGlvbihqc29uKSB7XG4gICAgdmFyIGNtID0gJCgnLkNvZGVNaXJyb3InKVswXS5Db2RlTWlycm9yO1xuICAgIHZhciBkb2MgPSBjbS5nZXREb2MoKTtcbiAgICBkb2MucmVwbGFjZVNlbGVjdGlvbnMoW1wiIVtdKC9cIiArIGpzb24uZmlsZS51cmwgKyBcIilcIl0pO1xufVxuXG5mdW5jdGlvbiBmaWxlc0FjdGlvbihqc29uKSB7XG4gICAgdmFyICRmaWxlTGluZSA9ICQoJzx0ciBpZD1cImZpbGUtJyArIGpzb24uZmlsZS5uYW1lICsgJ1wiPicgXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPicgKyBqc29uLmZpbGUudGltZSArICc8L3RkPidcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+JyArIGpzb24uZmlsZS5zaXplICsgJzwvdGQ+J1xuICAgICAgICArICc8dGQgY2xhc3M9XCJtZGwtZGF0YS10YWJsZV9fY2VsbC0tbm9uLW51bWVyaWNcIj4nICsganNvbi5maWxlLm5hbWUgKyAnPC90ZD4nXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPicgKyBqc29uLmZpbGUudHlwZSArICc8L3RkPidcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+J1xuICAgICAgICAgICsgJzxhIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbCBibHVlXCIgaHJlZj1cIi8nKyBqc29uLmZpbGUudXJsICsnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgdGl0bGU9XCIvJyArIGpzb24uZmlsZS5uYW1lICsgJ1wiPlZpZXc8L2E+Jm5ic3A7J1xuICAgICAgICAgICsgJzxhIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbCByZWQgZGVsZXRlLWZpbGVcIiBocmVmPVwiI1wiIG5hbWU9XCInICsganNvbi5maWxlLm5hbWUgKyAnXCIgcmVsPVwiJyArIGpzb24uZmlsZS51cmwgKyAnXCIgdGl0bGU9XCJEZWxldGVcIj5EZWxldGU8L2E+J1xuICAgICAgICArICc8L3RkPjwvdHI+Jyk7XG4gICAgJCgndGJvZHknKS5hcHBlbmQoJGZpbGVMaW5lKTtcbn1cblxuZnVuY3Rpb24gaW5pdFVwbG9hZChwKSB7XG4gICAgJCgnI2F0dGFjaC1zaG93Jykub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI2F0dGFjaC11cGxvYWQnKS50cmlnZ2VyKFwiY2xpY2tcIik7XG4gICAgfSk7XG4gICAgJCgnI2F0dGFjaC11cGxvYWQnKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJVcGxvYWQgbm93P1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBiYXIgPSAkKCc8cCBjbGFzcz1cImZpbGUtcHJvZ3Jlc3MgaW5saW5lLWJsb2NrXCI+MCU8L3A+Jyk7XG4gICAgICAgICAgICAkKCcjYXR0YWNoLWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICAgICAgICAgICAgICBcImJlZm9yZVN1Ym1pdFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICQocCkuYmVmb3JlKGJhcik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcInVwbG9hZFByb2dyZXNzXCI6IGZ1bmN0aW9uIChldmVudCwgcG9zaXRpb24sIHRvdGFsLCBwZXJjZW50Q29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBlcmNlbnRWYWwgPSBwZXJjZW50Q29tcGxldGUgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgIGJhci5jc3MoXCJ3aWR0aFwiLCBwZXJjZW50VmFsKS5odG1sKHBlcmNlbnRWYWwpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJzdWNjZXNzXCI6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJyNhdHRhY2gtdXBsb2FkJykudmFsKFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwiZXJyb3JcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFyLmh0bWwoanNvbi5tc2cpLmFkZENsYXNzKFwiZXJyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFyLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkZpbGUgaGFzIGJlZW4gdXBsb2FkZWQuXCIpXG4gICAgICAgICAgICAgICAgICAgIGJhci5odG1sKFwiL1wiICsganNvbi5maWxlLnVybCArIFwiJm5ic3A7Jm5ic3A7Jm5ic3A7KEBcIiArIGpzb24uZmlsZS5uYW1lICsgXCIpXCIpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQoJy5Db2RlTWlycm9yJykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzQWN0aW9uKGpzb24pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdG9yQWN0aW9uKGpzb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS52YWwoXCJcIik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuIl19
