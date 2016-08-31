/* See http://www.library.georgetown.edu/sites/default/files/summon/summon-customize.js
 * 2016-08-31 - Group "Films On Demand" as an Online Resource  
 * 2016-08-30 - Troubleshoot js caching issues  
 * 2016-08-29 - Recode for new Summon Markup  
 */
$(document).ready(function () {
    //Load custom CSS used by the elements in this code
	$(document).find("head").append("<style id='gu-custom-css' type='text/css'/>");
	$("#gu-custom-css").append(".holding-msg {font-weight: bold; margin-top: 9px; margin-bottom: 9px;}");
	$("#gu-custom-css").append(".holding-header-sep {border-top: dashed 1px #8d817b; padding-top: 9px;}");
	$("#gu-custom-css").append("div.chart .selection {fill: #679146; stroke: #6caddf;}");
    $("#gu-custom-css").append(".savedItemsFolder .badgeContainer .badge {background-color: #679146;}");
    $("#gu-custom-css").append(".fulltext {background-color: #679146;}");
    $("#gu-custom-css").append(".fulltext .fulltext-inner:before {border-color: #004990 transparent transparent !important;}");
    $("#gu-custom-css").append(".resultsPane .rollup {border-left: 4px solid #6caddf;}");
    $("#gu-custom-css").append(".resultsPane .imagesRollup .grid {margin-top: 0.6rem;}");
    $("#gu-custom-css").append(".resultsPane .imagesRollup .scrollBtn {background-color: #BAE0F7;}");
    $("#gu-custom-css").append(".Filter .applied:before {color: #679146;}");
    $("#gu-custom-css").append(".clearRefinements.customPrimaryLink::before, .icon-remove-sign::before {background-color: #98002e !important;}");
    $("#gu-custom-css").append("div.imagesRollup span.gu-artstor {color: #888; font-size: 0.8rem !important;}");
    $("#gu-custom-css").append("div.imagesRollup a.gu-artstor {color: rgb(0, 73, 144) !important;}");
    $("#gu-custom-css").append("div.imagesRollup a.customPrimaryLink {display:inline!important;}");
    $("#gu-custom-css").append(".availability a {color: #004990;}");
    $("#gu-custom-css").append("div.siteLinks > div {border-right: none;}");
    $("#gu-custom-css").append("div.siteLinks a.feedback {display: none;}");
    $("#gu-custom-css").append("div.siteLinks div.languageSwitcher {display: none;}");
    $("#gu-custom-css").append(".input-group-btn:last-child > .btn:last-of-type {margin-left:12px;}");
    $("#gu-custom-css").append(".site-white_cog {background-image: none; min-width: 95px;}");
    $("#gu-custom-css").append(".site-white_cog::before {content:'Advanced Search'; color: #BAE0F7; font-size: 80%; font-weight: bold; font-family:sans-serif;}");
    debug("Pre checkAll i");
    //Allow some time for real time availability data (rta) to load
    //setTimeout(function () {checkAll(); }, 500);
    checkAll();
});

//Not sure what this block is doing
$(document).ready(function () {
	$(document).find("body").append("<div class='needs-js'>&nbsp;</div>");
});
                  
//Load custom help resource
$(document).ready(function () {
	$(document).find("head").append("<script id='summon-proactive-chat' async='' type='text/javascript' src='//us.libraryh3lp.com/js/libraryh3lp.js?8796' />");
});


//Check for ArtStor image carousel.  (As of 8/2016, it may no longer be present)
function imageCheck() {
	$("div.imagesRollup:not(.gu-checked)").each(
		function () {
			var link = $("<span class='gu-artstor'>You must disable popups to access these images; see <a class='gu-artstor' href='http://www.library.georgetown.edu/onesearch-help#10' target='_blank'>OneSearch Help page</a> for more information</span>");
			$(this).find("div.grid").before(link);
			$(this).addClass("gu-checked");
		}
	);
}

//Control display of console messages
function isDebug() {
    return false;
}

function debug(s) {
    if (isDebug()){
        console.log(s);        
    }
}

//Check all result elements that have not been processed
function checkAll() {
	$("div.summary:not(.gu-checked)").each(
		function () {
			checkResult(this);
		}
	);
    imageCheck();
    //Due to incremental page load, schedule this task to run again
	setTimeout(function () {checkAll(); }, 500);
}


//Check a specific result, mark the result when complete
function checkResult(el) {
    var res = $(el).parents("div.documentSummary").find("span.resultNumber").text();
    debug("Checking result "+res);
    var total = $(el).find("div.docFooter>div.row>div>div:has(span.icon)").length;
    var rtael = $(el).find("div.docFooter>div.row>div>div:has(a.availabilityLink)");
    var rta = rtael.length;
    rtael.each(
        function () {
            if (testHolding(this)) {
                $(this).addClass("gu-holding");
            } else if (testOnlineHolding(this)) {
                $(this).addClass("online-holding");
            } else {
                $(this).addClass("non-gu-holding");
            }
        }
    );
    
    if (total == rta) {
        debug("Sequencing result "+res);
        $(el).addClass("gu-checked");

        var seq = $("<div class='holding-seq'/>");
        rtael.first().before(seq);
        
        if ($(el).find(".online-holding").is("*")) {
            var n = $("<div class='holding-msg'>This item is available online:</div>");
            seq.before(n);
            n.after($(el).find(".online-holding"));
            $(el).find(".online-holding").first().addClass("online-holding-first");
        }

        if ($(el).find(".gu-holding").is("*")) {
            var n = $("<div class='holding-msg'>This item is available at Georgetown Libraries:</div>");
            seq.before(n);
            n.after($(el).find(".gu-holding"));
            $(el).find(".gu-holding").first().addClass("gu-holding-first");
        }

        if ($(el).find(".non-gu-holding").is("*")) {
            var n = $("<div class='holding-msg'>This item is available at Consortium Libraries:</div>");
            seq.before(n);
            n.after($(el).find(".non-gu-holding"));
            $(el).find(".non-gu-holding").first().addClass("non-gu-holding-first");
        }
        
        seq.remove();
        $(el).find(".holding-msg").addClass("holding-header-sep");
        $(el).find(".holding-header-sep").first().removeClass("holding-header-sep");
        var gu = $(el).find(".gu-holding").length;
        var online = $(el).find(".online-holding").length;
        var nongu = $(el).find(".non-gu-holding").length;
        debug("Sequencing complete "+res+"; total="+total+"; rta="+rta+"; gu="+gu+"; online="+online+"; nongu="+nongu);
    } else {
        debug("Sequencing INCOMPLETE "+res);
    }
}

//Test for GU Holdings
//Expand WRCL library abbreviations to meaningful names
function testHolding(n) {
	var b = false;
	$(n).find("a.availabilityLink").each(function () {
        var orig = $(this).text();
		var t = $(this).text();
		
		//Check if it is a GU resource.  
		if (t.search(/ GT:( |$)/) > -1) {
		    if (t.search(/Films On Demand/) > -1) {
		        //Films on Demand also contain the GT: in their availability
		    } else {
	            b = true;		        
		    }
		}
		t = t.replace(/ GT: /, " Georgetown: ");
        t = t.replace(/ GT:$/, " Georgetown:");
		t = t.replace(/ GW: /, " George Washington: ");
		t = t.replace(/ GM: /, " George Mason: ");
		t = t.replace(/ CU: /, " Catholic: ");
		t = t.replace(/ AU: /, " American: ");
		t = t.replace(/ HU: /, " Howard: ");
		t = t.replace(/ MU: /, " Marymount: ");
		t = t.replace(/ GA: /, " Gallaudet: ");
		t = t.replace(/ DC: /, " UDC: ");
		$(this).text(t);
		debug(orig+"-->"+t+"; "+b);
	});
	return b;
}

//Test for online holdings
function testOnlineHolding(n) {
	var b = false;
	$(n).find("a.availabilityLink").each(function () {
		var t = $(this).text();
		if (t.search(/Full Text Online/) > -1) {
			b = true;
		} else if (t.search(/Citation Online/) > -1) {
			b = true;
		} else if (t.search(/Available Online/) > -1) {
			b = true;
		} else if (t.search(/Films On Demand/) > -1) {
			b = true;
		}
	});
	return b;
}

