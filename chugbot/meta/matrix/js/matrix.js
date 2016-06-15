var chugChecked = {};

$(function() {
        $.ajax({
                url: 'ajax.php',
		    type: 'post',
		    data: {get_nav: 1},
		    success: function(txt) {
		    var html = "<div class=\"nav_container\">" + txt + "</div>";
		    $("#nav").html(html);
		}
	    });
    });

$(function() {
	$( "#pulse" ).hide();		    
	$( "#SaveChanges" ).hide();
    });

$(function() {
	$( "#ShowMatrix" ).click(function(event) {
		event.preventDefault();		
		$( "#checkboxes" ).html("<div class=\"centered_container\"><p>Working: please wait...</p></div>");
		var firstLetterUC = $( "#firstletter" ).val().toLowerCase();
		var firstLetterLC = $( "#firstletter" ).val().toUpperCase();
		var chugNames = [];
		$.getScript('meta/matrix/js/jquery.fixedheadertable.min.js', function() {
			$.ajax({
				url: 'matrix.php',
				    type: 'post',
			    data: {get_chug_map: 1},
			    success: function(json) {
			    var obj = JSON.parse(json);
			    $.each(obj.chugMap, function(index, chugName) {
				    chugNames.push(chugName);
				});
			    $.each(obj.matrixMap, function(leftChug, rightChug2Enabled) {
				    $.each(rightChug2Enabled, function(rightChug, enabled) {
					    if (leftChug in chugChecked == false) {
						chugChecked[leftChug] = {};
					    }
					    chugChecked[leftChug][rightChug] = 1;
					});
				});    
			}, error: function(xhr, desc, err) {
			    console.log(xhr);
			    console.log("Details: " + desc + "\nError:" + err);
			    var errHtml = "<div class=error_box><h2>Error</h2><font=red>Unable to save changes: </font>" + err + ". Please contact an administrator.</div>";
			    $("#errors").html(errHtml);
			}
		    }).then(function() {
			    var target = $('#checkboxes');
			    var i, x, y, checkbox, html;			    
			    html = "<div class=\"matrix_container\"><table id=\"matrix\" class=\"fancyTable\" cellpadding=\"0\" cellspacing=\"0\"><thead><tr><th></th>";
			    for (i = 0; i < chugNames.length; i++) {
				html += "<th>" + chugNames[i] + "</th>";
			    }
			    html += "</tr></thead><tbody>";
			    var rowIndex = 0;
			    for (x = 0; x < chugNames.length; x++) {
				// Add a row for each chug, with zebra striping.  Only add rows
				// for chugim starting with the selected letter.
				if (! (chugNames[x].startsWith(firstLetterLC) ||
				       chugNames[x].startsWith(firstLetterUC))) {
				    continue;
				}
				oddText = "";
				if (rowIndex++ % 2 != 0) {
				    //oddText = "class=darkstripe";
				}             
				html += "<tr " + oddText + "><td>" + chugNames[x] + "</td>";
				for (y = 0; y < chugNames.length; y++) {
				    html += "<td>";
				    var checkedText = " ";
				    if ((chugNames[x] in chugChecked) &&
					chugNames[y] in chugChecked[chugNames[x]]) {
					checkedText = " checked=1 ";
				    }
				    checkbox = '<input type=checkbox' + checkedText;
				    checkbox += 'data-x="' + chugNames[x] + '"';
				    checkbox += ' data-y="' + chugNames[y] + '"';
				    checkbox += '/>';
				    html += checkbox;
				    html += "</td>";
				}
				html += "</tr>";
			    }
			    html += "</tbody></table></div>";			    
			    target.html(html); // Display the table.
			    target.show();
			    // For debugging: alert when a box is checked.
			    //target.on('change', 'input:checkbox', function() {
			    //var $this = $(this),
			    //  x = $this.data('x'),
			    //  y = $this.data('y'),
			    //  checked = $this.prop('checked');
			    //alert('checkbox changed chug intersection (' + x + ', ' + y + '): ' + checked);
			    //});
			}).then(function() {
				$( '#matrix' ).fixedHeaderTable({
					footer: true,
					    altClass: 'odd',
					    cloneHeadToFoot: true,
					    fixedColumns: 1
					    });
				$( '#SaveChanges' ).show();
			    });
		    })
		    })
	    });

$(function() {
        $("#SaveChanges").click(function(event) {
                event.preventDefault();
		var leftRight2Checked = {};
		$('#matrix').find('input[type="checkbox"]').each(function () {
			var $this = $(this);
			var leftChug = $this.data('x');
			var rightChug = $this.data('y');
			if (leftChug in leftRight2Checked == false) {
			    leftRight2Checked[leftChug] = {};
			}
			leftRight2Checked[leftChug][rightChug] = $this.prop('checked') ? 1: 0;
		    });
		// Send ajax.
		var curUrl = window.location.href;
		var homeUrl = curUrl.replace("exclusionMatrix.html", "staffHome.php");
		// Remove query string before redir.
		var qpos = homeUrl.indexOf("?");
		if (qpos) {
		    homeUrl = homeUrl.substr(0, qpos);
		}
		$.ajax({
			url: 'matrix.php',
			    type: 'post',
			    data: {update_table:1, checkMap:leftRight2Checked},
			    success: function(data) {
			    homeUrl += "?update=ex";
			    window.location.href = homeUrl;
			},
			    error: function(xhr, desc, err) {
                            console.log(xhr);
                            console.log("Details: " + desc + "\nError:" + err);
			    var errHtml = "<div class=error_box><h2>Error</h2><font=red>Unable to save changes: </font>" + err + ". Please contact an administrator.</div>";
			    $("#errors").html(errHtml);
                        }
                    });
	    });
    });
		    
		
