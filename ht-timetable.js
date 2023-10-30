var hours = function() {
	let data = [];
	let trs = $(".personelPdksGirisCikisListesi .gridContainer tbody tr");
	let trsLength = trs.length;
	let previousDirection;
	for (let i = 0; i < trsLength; i++) {
		let tr = $(trs[i]);
		let tds = tr.find("td:visible");
		let timestamp = moment(tds[0].innerText, "DD.MM.YYYY HH:mm:ss");
		let direction = tds[1].innerText;
		if (direction === previousDirection) continue;
		previousDirection = direction;
		let date = timestamp.format("DD.MM.YYYY");
		let time = timestamp.format("HH:mm:ss");
		let lastItemIndex = data.length - 1;
		if (lastItemIndex === -1 || data[lastItemIndex]["Tarih"] !== date) {
			data.push({ "Tarih": date, "Saatler": [] });
			lastItemIndex = data.length - 1;
		}
		if (direction === "G") {
			data[lastItemIndex]["Saatler"].push({"Giriş": time});
		}
		else if (direction === "C") {
			if (data[lastItemIndex]["Saatler"].length === 0) {
				if (lastItemIndex > 0) {
					var prevItemIndex = lastItemIndex - 1;
					data[prevItemIndex]["Saatler"][data[prevItemIndex]["Saatler"].length - 1]["Çıkış"] = "23:59:59";
					data[prevItemIndex]["Saatler"][data[prevItemIndex]["Saatler"].length - 1]["ÇalışılanSüre"] = addTime("23:59:59", data[prevItemIndex]["Saatler"][data[prevItemIndex]["Saatler"].length - 1]["Giriş"], true);
				}
				data[lastItemIndex]["Saatler"].push({"Giriş": "00:00:00"});
			}
			data[lastItemIndex]["Saatler"][data[lastItemIndex]["Saatler"].length - 1]["Çıkış"] = time;
			data[lastItemIndex]["Saatler"][data[lastItemIndex]["Saatler"].length - 1]["ÇalışılanSüre"] = addTime(time, data[lastItemIndex]["Saatler"][data[lastItemIndex]["Saatler"].length - 1]["Giriş"], true);
		}
	}
	let lastItem = data[data.length - 1]["Saatler"];
	if (!lastItem[lastItem.length - 1]["Çıkış"]) {
		$("#stillInside")[0].checked = true;
		let currentTime = $("#expectedExitTime").val();
		if (!currentTime) {
			currentTime = new Date().toLocaleTimeString("tr", {timeZone: "Europe/Istanbul"});
			$("#expectedExitTime").val(currentTime);
		}
		$("#autoUpdate").prop("disabled", false);
		lastItem[lastItem.length - 1]["Çıkış"] = currentTime;
		lastItem[lastItem.length - 1]["ÇalışılanSüre"] = addTime(currentTime, lastItem[lastItem.length - 1]["Giriş"], true);
	}
	else {
		$("#stillInside")[0].checked = false;
		$("#expectedExitTime").val("");
		$("#autoUpdate").prop("disabled", true);
		$("#autoUpdate")[0].checked = false;
	}
	
	let tbody = $("#timetable tbody");
	tbody.empty(); 
	$("#modalHeader").text($("#Donem_Id option:selected").text() + " - " + $("#Personel_Id option:selected").text());
	data.map(d => d["IcerideGunToplami"] = timeSum(d["Saatler"].map(s => s["ÇalışılanSüre"])));
	data.map(d => d["GunToplami"] = addTime(d["Saatler"][d["Saatler"].length - 1]["Çıkış"], d["Saatler"][0]["Giriş"], true));
	data.map(d => d["Gün"] = getDayOfWeek(d["Tarih"]));
	
	let days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
	let weekTotal = "0:0:0";
	let weekTotalInside = "0:0:0";
	let weekCount = 0;
	for (let i in data) {
		if (i > 0) {
			if (data[i - 1]["Gün"] > data[i]["Gün"] || parseInt(data[i]["Tarih"].split(".")[0]) - parseInt(data[i - 1]["Tarih"].split(".")[0]) > 6 ) {
				weekTotal = "0:0:0";
				weekTotalInside = "0:0:0";
				weekCount += 1;
			}
		}
		weekTotal = addTime(weekTotal, data[i]["GunToplami"]);
		weekTotalInside = addTime(weekTotalInside, data[i]["IcerideGunToplami"]);
		data[i]["HaftaToplami"] = weekTotal;
		data[i]["IcerideHaftaToplami"] = weekTotalInside;
		let tr = $("<tr class='gun-" + data[i]["Gün"] + " week-" + weekCount + "'></tr>");
		tr.append("<td>" + days[data[i]["Gün"]] + "</td>");
		tr.append("<td>" + data[i]["Tarih"] + "</td>");
		tr.append("<td>" + data[i]["Saatler"].map(s => s["Giriş"]).join("<br/>") + "</td>");
		tr.append("<td>" + data[i]["Saatler"].map(s => s["Çıkış"]).join("<br/>") + "</td>");
		tr.append("<td>" + data[i]["Saatler"].map(s => s["ÇalışılanSüre"]).join("<br/>") + "</td>");
		tr.append("<td>" + data[i]["IcerideGunToplami"] + "</td>");
		tr.append("<td>" + data[i]["GunToplami"] + "</td>");
		tr.append("<td><strong>" + data[i]["IcerideHaftaToplami"] + "</strong></td>");
		tr.append("<td><strong>" + data[i]["HaftaToplami"] + "</strong></td>");
		tbody.append(tr);
	}
	$(".week-0:nth-of-type(odd) td").css("cssText", "background-color: #b4eeb4 !important");
	$(".week-0:nth-of-type(even) td").css("cssText", "background-color: #d3ffce !important");
	$(".week-1:nth-of-type(odd) td").css("cssText", "background-color: #c1dced !important");
	$(".week-1:nth-of-type(even) td").css("cssText", "background-color: #d1ecfd !important");
	$(".week-2:nth-of-type(odd) td").css("cssText", "background-color: #b4eeb4 !important");
	$(".week-2:nth-of-type(even) td").css("cssText", "background-color: #d3ffce !important");
	$(".week-3:nth-of-type(odd) td").css("cssText", "background-color: #c1dced !important");
	$(".week-3:nth-of-type(even) td").css("cssText", "background-color: #d1ecfd !important");
	$(".week-4:nth-of-type(odd) td").css("cssText", "background-color: #b4eeb4 !important");
	$(".week-4:nth-of-type(even) td").css("cssText", "background-color: #d3ffce !important");
	$(".week-5:nth-of-type(odd) td").css("cssText", "background-color: #c1dced !important");
	$(".week-5:nth-of-type(even) td").css("cssText", "background-color: #d1ecfd !important");
	
	$("#timetableModal td").css("vertical-align", "middle");
	$("#timetableModal").show();
	
	calculateRemaining();
}

var calculateRemaining = function() {
	let target = $("#target").val();
	let targetTime = $("#targetTime").val();
	let currentWorkTime = target === "HT" ? $("#timetable tbody tr:last td:last").text() : $("#timetable tbody tr:last td:nth-child(8)").text();
	let diff = addTime(targetTime, currentWorkTime, true);
	$("#remainingTime").val(diff);
}

var getDayOfWeek = function(date) {
	let dateArgs = date.split(".");
	return (new Date(dateArgs[2], dateArgs[1] - 1,dateArgs[0]).getDay() + 6) % 7; // makes sunday last
}

var timeSum = function(list) {
	let sum = "0:0:0";
	for (let i = 0; i < list.length; i++) {
		sum = addTime(sum, list[i]);
	}
	return sum;
}

var addTime = function(t1, t2, negateSecond) {
	let t1Args = t1.split(":");
	let t2Args = t2.split(":");
	let t1Seconds = parseInt(t1Args[0]) * 3600 + parseInt(t1Args[1]) * 60 + parseInt(t1Args[2]);
	let t2Seconds = parseInt(t2Args[0]) * 3600 + parseInt(t2Args[1]) * 60 + parseInt(t2Args[2]);
	let resultTotalSeconds = negateSecond ? (t1Seconds - t2Seconds) : (t1Seconds + t2Seconds);
	let resultHours = Math.floor(resultTotalSeconds / 3600);
	let resultMinutes = Math.floor((resultTotalSeconds % 3600) / 60);
	let resultSeconds = Math.floor(resultTotalSeconds % 60);
	if (resultHours < 10) resultHours = "0" + resultHours;
	if (resultMinutes < 10) resultMinutes = "0" + resultMinutes;
	if (resultSeconds < 10) resultSeconds = "0" + resultSeconds;
	return resultHours + ":" + resultMinutes + ":" + resultSeconds;
}
$(".ui-dialog-titlebar").append($('<div class="jarviswidget-ctrls" role="button"><a href="#" id="showTimetable" class="button-icon"><i class="fa fa-table"></i></a></div>'));
$("body").append(`
	<div id="timetableModal" class="shadow10 modal" style="background-color:white;z-index:2000;width:calc(100% - 450px);height:580px;position:fixed;top:120px;left:410px;">
		<div class="modal-header">
			<div class="jarviswidget-ctrls" role="button"><a href="#" id="hideTimetableModal" class="button-icon"><i class="fa fa-times"></i></a></div>
			
			<p id="modalHeader" style='font-size:16px;padding:5px 0 0 20px;margin-bottom:2px;'>&nbsp;</p>
		</div>
		<div class="modal-body table-responsive" style="max-height:454px;height:454px;">
			<div>
				<table id="timetable" class="table table-striped table-bordered">
					<thead>
						<td><strong>Gün</strong></td>
						<td><strong>Tarih</strong></td>
						<td><strong>Giriş</strong></td>
						<td><strong>Çıkış</strong></td>
						<td><strong>İçeride Geçen Süre</strong></td>
						<td><strong>İçeride Geçen Toplam Süre</strong></td>
						<td><strong>İlk Giriş - Son Çıkış Süre</strong></td>
						<td><strong>İçeride Geçen Hafta Toplam Süre</strong></td>
						<td><strong>Hafta Toplam Süre</strong></td>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</div>
		<div class="modal-footer">
			<p style='font-size:16px;padding:5px 0 0 20px;margin-bottom:2px;text-align:left;'>
				<label for="target">Hedeflenen</label>
				<select id="target" style="width:130px;"><option value="HT">Hafta Toplam</option><option value="IT">İçeride Toplam</option></select>
				<input type="text" id="targetTime" style="font-size:14px;border:1px solid silver;width:60px;" value="45:00:00" />
				<label for="remainingTime">Kalan</label>
				<input type="text" id="remainingTime" style="font-size:14px;border:1px solid silver;width:60px;" value="" disabled />
				<span style="margin-left:15px;margin-right:15px;">|</span>
				<input type="checkbox" id="stillInside" disabled/>
				<label for="stillInside">İçeride</label>
				<label for="expectedExitTime" style="margin-left:10px;">Çıkış saati</label>
				<input type="text" id="expectedExitTime" style="font-size:14px;border:1px solid silver;width:60px;" />
				<a style="margin-left:10px;color:green;" href="#" id="refreshTimetable" class="button-icon"><i class="fa fa-refresh fa-lg"></i></a>
				<input type="checkbox" id="autoUpdate" />
				<label for="autoUpdate">Otomatik Güncelle</label>
			</p>
		</div>
	</div>
`);

$(document).on("click", "#hideTimetableModal", function(){
  if (autoUpdateTimer) {
    $("#autoUpdate")[0].checked = false;
		clearInterval(autoUpdateTimer);
  }
	$("#timetableModal").hide();
});

$(document).on("click", "#showTimetable, #refreshTimetable", hours);

$(document).on("change", "#target", function(){
	if ($(this).val() === "HT") {
		$("#targetTime").val("45:00:00");
	}
	else {
		$("#targetTime").val("40:00:00");
	}
	calculateRemaining();
});

$(document).on("change", "#targetTime", calculateRemaining);

var autoUpdateTimer;
$(document).on("change", "#autoUpdate", function() {
	let v = $("#autoUpdate")[0].checked;
	if (v) {
		autoUpdateTimer = setInterval(function() {
			let currentTime = new Date().toLocaleTimeString("tr");
			$("#expectedExitTime").val(currentTime);
			hours();
		}, 1000);
	}
	else {
		clearInterval(autoUpdateTimer);
	}
});
