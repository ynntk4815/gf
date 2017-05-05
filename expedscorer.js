function p(){

            $('.tab_expedscorer .expedNumbers').html("");

            $.ajaxSetup({
                async: false
            });
            $.getJSON("expedscorer.json", function(data) {
                $.each(data.expeds, function(key, val) {
                    var row = $('.tab_expedscorer .factory .expedNum').clone();
                    $(".expedCheck input", row).attr("value", val.id);
                    $(".expedFixedCheck input", row).attr("value", val.id);
                    $(".expedText", row).text(idToCommonCalledId(val.id));
                    $(".expedTime", row).text(val.time.h + ":" + val.time.m);

                    var boxNum = parseInt(idToEp(val.id));
                    $(".tab_expedscorer .expedNumBox_"+boxNum).append( row );
                });
            }).fail(function() {
                alert("test2");
            });

            // Add world toggle
            $(".tab_expedscorer .expedNumBox")
                .filter(function(i,x){return $(x).hasClass("expedNumBox_"+(i));})
                .each(function(i,x){
                    var
                        row = $('.tab_expedscorer .factory .expedNum').clone().addClass("expedWhole").removeClass("expedNum"),
                    val = true;
                    $("input",".expedCheck .expedNumBox_"+(i)).each(function(id,elm){
                        val&= $(elm).prop("checked");
                    });
                    $(row)
                        .find(".expedCheck input")
                        .attr("value", i)
                        .prop("checked", val)
                        .end()
                        .find(".expedText")
                        .text( "Ep " + (i) )
                        .end()
                        .find(".expedTime")
                        .remove()
                        .end()
                        .find(".expedFixedCheck")
                        .remove()
                        .end();

                    $(x).prepend(row);
                }).on("click", '.expedNum .expedCheck input', function(){
                    var
                        worldNum     = parseInt(idToEp($(this).attr("value"))),
                    context      = ".tab_expedscorer .expedNumBox_"+worldNum,
                    parentCheck  = true;
                    self.exped_filters = [];
                    $(".expedNum .expedCheck   input",context).each(function(i,x){ parentCheck &= $(x).prop("checked"); 
                    });
                    $(".expedWhole .expedCheck input",context).prop("checked",parentCheck);
                }).on("click", ".expedWhole .expedCheck input", function() {
                    var
                        worldNum = $(this).val(),
                    state    = $(this).prop("checked"),
                    expeds   = $(".tab_expedscorer .expedNumBox_"+worldNum+" .expedNum .expedCheck input");
                    expeds.each(function(i,x){
                        var
                            elmState = $(x).prop("checked"),
                        expedNum = parseInt($(x).val());
                        if(elmState ^ state) { // check different state
                            $(x).prop("checked",state);
                        }
                    });
                });

            // Calculate
            var resultTable = $('.tab_expedscorer .results tbody');
            $('.tab_expedscorer .calculate_btn').click(function(){
                var priorityManpower = $(".tab_expedscorer .priorityManpower").val() * 1;
                var priorityAmmo = $(".tab_expedscorer .priorityAmmo").val() * 1;
                var priorityRation = $(".tab_expedscorer .priorityRation").val() * 1;
                var priorityPart = $(".tab_expedscorer .priorityPart").val() * 1;
                var priorityQuickRepair = $(".tab_expedscorer .priorityQuickRepair").val() * 1;
                var priorityQuickDone = $(".tab_expedscorer .priorityQuickDone").val() * 1;
                var priorityContract = $(".tab_expedscorer .priorityContract").val() * 1;
                var priorityEquipment = $(".tab_expedscorer .priorityEquipment").val() * 1;
                var afkHH = $(".tab_expedscorer .afkH").val() * 1;
                var afkMM = $(".tab_expedscorer .afkM").val() * 1;

                var afkTime = afkHH * 60 + afkMM;

                var selectedItemsQ = $('.tab_expedscorer .expedNumBox .expedNum .expedCheck input:checked');

                var selectedItems = [];
                selectedItemsQ.each( function() {
                    selectedItems.push($(this).attr("value"));
                });

                var selectedFixedItemsQ = $('.tab_expedscorer .expedNumBox .expedNum .expedFixedCheck input:checked');

                var selectedFixedItems = [];
                selectedFixedItemsQ.each( function() {
                    selectedFixedItems.push($(this).attr("value"));
                });

                var fleetCount = parseInt( $(".tab_expedscorer .fleetCounts input:checked").val(), 10);

                var fleetGreatSuccess = 60;

                var results = calcWithExpeditionIdsFleetCountJS(fleetCount, priorityManpower, priorityAmmo, priorityRation, priorityPart, selectedItems, afkTime, fleetGreatSuccess,
                        priorityQuickRepair, priorityQuickDone, priorityContract, priorityEquipment, selectedFixedItems);

                resultTable.empty();
                for (var i = 0; i < results.length && i < 50; ++i) {
                    var curVal = results[i];
                    var row = $('<tr></tr>');
                    $('<td></td>').text(curVal.eIds).appendTo(row);
                    $('<td></td>').text(curVal.manpower.toFixed(0)).appendTo(row);
                    $('<td></td>').text(curVal.ammo.toFixed(0)).appendTo(row);
                    $('<td></td>').text(curVal.ration.toFixed(0)).appendTo(row);
                    $('<td></td>').text(curVal.part.toFixed(0)).appendTo(row);
                    $('<td></td>').text(curVal.quickRepair.toFixed(3)).appendTo(row);
                    $('<td></td>').text(curVal.quickDone.toFixed(3)).appendTo(row);
                    $('<td></td>').text(curVal.contract.toFixed(3)).appendTo(row);
                    $('<td></td>').text(curVal.equipment.toFixed(3)).appendTo(row);
                    $('<td></td>').text(curVal.resourceScore.toFixed(0)).appendTo(row);
                    $('<td></td>').text(curVal.resourceSum.toFixed(0)).appendTo(row);
                    resultTable.append( row );

                }

                var unitTimes = $(".tab_expedscorer .results .unitTime");
                    unitTimes.each(function() {
                        var str = "hr";
                        if (afkTime > 0) {
                            str = afkHH + "h" + afkMM + "m";
                        }
                        $(this).empty();
                        $(this).append(str);
                    });
            });
}

function compare(a,b) {
    if (a.resourceScore < b.resourceScore)
        return 1;
    if (a.resourceScore > b.resourceScore)
        return -1;
    if (a.resourceScore == b.resourceScore) {
        if (a.resourceSum < b.resourceSum)
            return 1;
        if (a.resourceSum > b.resourceSum)
            return -1;
    }
    return 0;
}

function idToCommonCalledId(id) {
    return idToEp(id) + "-" + ((1 * id - 1) % 4 + 1);
}

function idToEp(id) {
    return parseInt((1 * id - 1) / 4);
}

function getExpedMinutesTime(exped) {
    return 60 * exped.time.h + 1 * exped.time.m;
}

function calcWithExpeditionIdsFleetCountJS(fleetCount, priorityManpower, priorityAmmo, priorityRation, priorityPart, selectedItems, afkTime, fleetGreatSuccess,
        priorityQuickRepair, priorityQuickDone, priorityContract, priorityEquipment, selectedFixedItems) {
    var expeds = [];
    var result = [];

    $.ajaxSetup({
        async: false
    });
    $.getJSON("expedscorer.json", function(data) {
        $.each(data.expeds, function(key, val) {
            expeds.push(val);
        });
    }).fail(function() {
        alert("test2");
    });

    //var ids = [];
    //expeds.forEach(function(val) {
    //    ids.push(val.id);
    //});

    var perUnitTime = 60;
    var ids = selectedItems;
    if (afkTime > 0) {
        ids = [];
        selectedItems.forEach(function(val) {
            var grepList = $.grep(expeds, function(e){ return e.id == val; });
            var exped = grepList[0];

            var expedTime = getExpedMinutesTime(exped);
            if (getExpedMinutesTime(exped) > afkTime) {
                if (expedTime % afkTime == 0) {
                    ids.push(val);
                } else {
                    //ids.push(val);
                }
            } else {
                ids.push(val);
            }
        });
    }

    ids = $(ids).not(selectedFixedItems).get();
    idset = combine(ids, fleetCount - selectedFixedItems.length, selectedFixedItems);
    idset.forEach(function(val) {
        var eCombine = {};
        eCombine.eIds = "";
        eCombine.manpower = 0.0;
        eCombine.ammo = 0.0;
        eCombine.ration = 0.0;
        eCombine.part = 0.0;
        eCombine.quickRepair = 0.0;
        eCombine.quickDone = 0.0;
        eCombine.contract = 0.0;
        eCombine.equipment = 0.0;
        eCombine.resourceScore = 0.0;
        eCombine.resourceSum = 0.0;
        tIds = [];
        for (var i = 0; i < val.length; ++i) {
            tIds.push(idToCommonCalledId(val[i]));
            var grepList = $.grep(expeds, function(e){ return e.id == val[i]; });
            var exped = grepList[0];
            var expedItemCount = 0;
            if (exped.quickRepair > 0) expedItemCount++;
            if (exped.quickDone > 0) expedItemCount++;
            if (exped.contract > 0) expedItemCount++;
            if (exped.equipment > 0) expedItemCount++;

            var incomeManpower = 0;
            var incomeAmmo = 0;
            var incomeRation = 0;
            var incomePart = 0;
            var incomeQuickRepair = 0.0;
            var incomeQuickDone = 0.0;
            var incomeContract = 0.0;
            var incomeEquipment = 0.0;
            var expedTime = getExpedMinutesTime(exped);

            if (afkTime > 0) {
                if (getExpedMinutesTime(exped) > afkTime) {
                    incomeManpower = 1 * exped.manpower / expedTime * afkTime;
                    incomeAmmo = 1 * exped.ammo / expedTime * afkTime;
                    incomeRation = 1 * exped.ration / expedTime * afkTime;
                    incomePart = 1 * exped.part / expedTime * afkTime;

                    incomeQuickRepair = incomeItem(exped.quickRepair, expedItemCount, fleetGreatSuccess) / expedTime * afkTime;
                    incomeQuickDone = incomeItem(exped.quickDone, expedItemCount, fleetGreatSuccess) / expedTime * afkTime;
                    incomeContract = incomeItem(exped.contract, expedItemCount, fleetGreatSuccess) / expedTime * afkTime;
                    incomeEquipment = incomeItem(exped.equipment, expedItemCount, fleetGreatSuccess) / expedTime * afkTime;
                } else {
                    incomeManpower = 1 * exped.manpower;
                    incomeAmmo = 1 * exped.ammo;
                    incomeRation = 1 * exped.ration;
                    incomePart = 1 * exped.part;

                    incomeQuickRepair = incomeItem(exped.quickRepair, expedItemCount, fleetGreatSuccess);
                    incomeQuickDone = incomeItem(exped.quickDone, expedItemCount, fleetGreatSuccess);
                    incomeContract = incomeItem(exped.contract, expedItemCount, fleetGreatSuccess);
                    incomeEquipment = incomeItem(exped.equipment, expedItemCount, fleetGreatSuccess);
                }

                //incomeManpower = incomeManpower / afkTime * perUnitTime;
                //incomeAmmo = incomeAmmo / afkTime * perUnitTime;
                //incomeRation = incomeRation / afkTime * perUnitTime;
                //incomePart = incomePart / afkTime * perUnitTime;
            } else {
                incomeManpower = 1 * exped.manpower / expedTime * perUnitTime;
                incomeAmmo = 1* exped.ammo / expedTime * perUnitTime;
                incomeRation = 1 * exped.ration / expedTime * perUnitTime;
                incomePart = 1 * exped.part / expedTime * perUnitTime;

                incomeQuickRepair = incomeItem(exped.quickRepair, expedItemCount, fleetGreatSuccess) / expedTime * perUnitTime;
                incomeQuickDone = incomeItem(exped.quickDone, expedItemCount, fleetGreatSuccess) / expedTime * perUnitTime;
                incomeContract = incomeItem(exped.contract, expedItemCount, fleetGreatSuccess) / expedTime * perUnitTime;
                incomeEquipment = incomeItem(exped.equipment, expedItemCount, fleetGreatSuccess) / expedTime * perUnitTime;
            }

            eCombine.manpower += incomeManpower;
            eCombine.ammo += incomeAmmo;
            eCombine.ration += incomeRation;
            eCombine.part += incomePart;
            eCombine.quickRepair += incomeQuickRepair;
            eCombine.quickDone += incomeQuickDone;
            eCombine.contract += incomeContract;
            eCombine.equipment += incomeEquipment;
            eCombine.resourceSum += incomeManpower;
            eCombine.resourceSum += incomeAmmo;
            eCombine.resourceSum += incomeRation;
            eCombine.resourceSum += incomePart;
            eCombine.resourceScore += incomeManpower * priorityManpower;
            eCombine.resourceScore += incomeAmmo * priorityAmmo;
            eCombine.resourceScore += incomeRation * priorityRation;
            eCombine.resourceScore += incomePart * priorityPart;
            eCombine.resourceScore += incomeQuickRepair * priorityQuickRepair;
            eCombine.resourceScore += incomeQuickDone * priorityQuickDone;
            eCombine.resourceScore += incomeContract * priorityContract;
            eCombine.resourceScore += incomeEquipment * priorityEquipment;
        }

        eCombine.eIds = tIds.join(", ");
        result.push(eCombine);
    });

    result.sort(compare);
    return result;
}

function incomeItem(expedItem, expedItemCount, fleetGreatSuccess) {
    if (expedItemCount == 0) return 0;
    if (expedItem == 0) return 0;
    return fleetGreatSuccess * 0.01 / expedItemCount + (1 - fleetGreatSuccess * 0.01) * expedItem * 0.01;
}

function combine(elements, combineLength, selectedFixedItems) {
    var list = [];

    if (combineLength <= 0) {
        list.push(selectedFixedItems)
        return list;
    }

    for (var i = 0; i < elements.length - combineLength + 1; ++i) {
        if (combineLength == 1) {
            var t = [];
            t = t.concat(selectedFixedItems);
            t.push(elements[i]);
            list.push(t);
        } else {
            ll = combine(elements.slice(i + 1, elements.length), combineLength - 1, selectedFixedItems);
            ll.forEach(function(val) {
                val.splice(selectedFixedItems.length, 0, elements[i]);
            });
            list = list.concat(ll);
        }
    }

    return list;
}
