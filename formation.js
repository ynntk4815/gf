
const TYPES = ["hg", "smg", "ar", "rf", "mg", "sg"];
const GRIDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SKILL_TYPE_IS_PERCENT = ["hit", "dodge", "armor", "fireOfRate", "dmg", "criRate", "cooldownTime", "criDmg", "movementSpeed", "rate", "reducedDamage"];
const SKILL_EFFECT_KEY_COPY = ["target", "type", "everyTime", "stackMax", "stackUpWhenEveryTime", "cleanBuff", "name", "initStack", "prepareTime", "attackSkillTimes", "radius"];
const SKILL_EFFECT_KEY_NESTED = ["rate", "attackToArmor", "extraToTarget"];
const CHAR_LEVEL_EQUIPMENT = [20, 50, 80];
const FRAME_PER_SECOND = 30;
const PREPARE_TO_USE_SKILL = "prepareToUseSkill";
const USE_ATTACK_SKILL = "useAttackSkill";
const CONTROL_CONTAINER = "control_container";
const EQUIPMENT_CONTAINER = "equipment_container";
const PERFORMANCE = "performance";
const ACTION = "action";
const SINGLE_LINK = "single_link";
const MULTI_LINK = "multi_link";
const FRIENDSHIP = "friendship";
const NONE_FRIENDLY = "none_friendly";
const FRIENDLY = "friendly";
const MARRIED = "married";
const NONE_FRIENDLY_SRC = "assets/none_friendly.png";
const FRIENDLY_SRC = "assets/friendly.png";
const MARRIED_SRC = "assets/married.png";
const FAIRY_TYPE = ["battle", "strategy"];
const CHAR_SKILL = "char_skill";
const FAIRY_SKILL = "fairy_skill";
const FAIRY_MASTERY = "fairy_mastery";
const BUFF = "buff";
const FORTRESS = "fortress";
const ALLY = "ally";
const EXTRA = "extra";
const CHAR_RARITY_LISTS = ["2", "3", "4", "5", "extra"];

var mPickerType = "";
var mPickerEquipmentIndex = "";
var mEquipmentData = "";
var mFairyData = "";
var mStringData = "";
var mUpdate = [];
var mCharData = [];
var mGridOrder = [];
var mFormation = [];
var mGridToUI = [];
var mGridToChar = [];
var mGridHasChar = [];
var mDmgLinkMode = SINGLE_LINK;
var mIsDetailCalculate = false;
var mFairy = null;

function init() {
    initData();
    initFormation();
    initDialog();

    $('.add_button').click(function() {
        openDialogPicker($(this).attr("grid_value"));
    });

    $('.char .img').addClass("hover").click(function() {
        openDialogPicker($(this).attr("grid_value"));
    });

    $('.char .level').change(function() {
        updateCharObs();
        updateEquipmentUIByGrid($(this).attr("grid_value"));
        updatePerformance();
    });

    $('.equipment_container select').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.char .skill_level').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.char .skill_stack').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.char .skill_control').change(function() {
        updateCharObs();
        updatePerformance();

        var allCheck  = true;
        $(".skill_control").filter(function(i, x) {
            return $(x).prop("disabled") == false;
        }).filter(function(i, x) {
            return mGridHasChar.indexOf($(x).attr("grid_value")) >= 0;
        }).each(function(i, x) {
            allCheck &= $(x).prop("checked");
        });
        $(".skill_all").prop("checked", allCheck);
    });

    $('.fairy_control_container select').change(function() {
        updateFairy();
        updateCharObs();
        updatePerformance();
    });

    $('.fairy_control_container .skill_control').change(function() {
        updateFairy();
        updateCharObs();
        updatePerformance();
    });

    $('.battle_control input').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.battle_control .battleisNight').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.battle_control .battleFortress').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.battle_control .fortress_level').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.battle_control .battleFortress_container label').hover(function(){
        var fortressLevel = $('.battle_control .fortress_level').val();
        var texts = getFortressDetail(fortressLevel);

        $('#detail').dialog({position: {my: "left top", at: "right top", of: $(this)}});
        $("#detail .detail_container").html("");
        $("#detail .detail_container").html(texts.join("<br>"));
        $('#detail').dialog("open");
    }, function(){
        $('#detail').dialog("close");
    });

    $('.dmgLinkSwitch').click(function() {
        if (mDmgLinkMode == SINGLE_LINK) {
            mDmgLinkMode = MULTI_LINK;
            $(this).html(mStringData.multiLink);
        } else {
            mDmgLinkMode = SINGLE_LINK;
            $(this).html(mStringData.singleLink);
        }
        updateCharObs();
        updatePerformance();
    });

    $(".grid_container").draggable({revert: "invalid", helper: "clone"});

    $(".grid_container").droppable({
        accept: ".grid_container",
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active",
        drop: function(event, ui) {

            var draggable = ui.draggable, droppable = $(this),
                dragPos = draggable.position(), dropPos = droppable.position();

            draggable.css({
                left: dropPos.left+'px',
                top: dropPos.top+'px'
            });

            droppable.css({
                left: dragPos.left+'px',
                top: dragPos.top+'px'
            });
            draggable.swap(droppable);
            swapGridUI(draggable, droppable);

            setTimeout(function() {
                updateCharObs();
                updatePerformance();
            }, 0);
        }
    });

    $('.view_equipment').change(function() {
        if ($(this).is(":checked")) {
            for (var i in GRIDS) {
                if (mGridToChar[GRIDS[i]] != "") {
                    var charObj = mGridToChar[GRIDS[i]];
                    var uiObj = getGridUiObj(GRIDS[i]);
                    uiObj.find(".char").hide();
                    uiObj.find('.equipment_container').show();
                }
            }
        } else {
            for (var i in GRIDS) {
                if (mGridToChar[GRIDS[i]] != "") {
                    var charObj = mGridToChar[GRIDS[i]];
                    var uiObj = getGridUiObj(GRIDS[i]);
                    uiObj.find(".char").show();
                    uiObj.find('.equipment_container').hide();
                }
            }
        }
    });

    $('.button.close').click(function() {
        $('#picker').dialog("close");
        $('#picker_by_type').dialog("close");
        $('#picker_equipment').dialog("close");
        $('#detailCalculate').dialog("close");
        $('#updateDialog').dialog("close");
        $('#picker_fairy').dialog("close");
    });

    var pre = getUrlParameter('pre');
    if (pre) {
        var preObject = JSON.parse(pre);
        if (!jQuery.isEmptyObject(preObject["char"])) {
            var formation = preObject["char"];
            $.each(formation, function(key, val) {
                var controlUI = getGridUiObj(""+val.g).find(".control_container");
                var equipmentUI = getGridUiObj(""+val.g).find(".equipment_container");
                controlUI.find(".level").val(val.lv);
                controlUI.find(".skill_level").val(val.slv);
                addChar(val.g, val.id);
                for (var i in val.eq) {
                    var e = val.eq[i];
                    addEquipment(val.g, e.i, e.id);
                    equipmentUI.find(".equipment_strengthen_"+e.i).val(e.lv);
                }
            });
        }

        if (!jQuery.isEmptyObject(preObject["fairy"])) {
            var fairyControlContainer = $(".fairy_container .fairy_control_container");
            fairyControlContainer.find(".level").val(preObject["fairy"].lv);
            fairyControlContainer.find(".rarity").val(preObject["fairy"].r);
            fairyControlContainer.find(".skill_level").val(preObject["fairy"].slv);
            fairyControlContainer.find(".mastery").val(preObject["fairy"].m);
            addFairy(preObject["fairy"].id);
        }
    }

    $('.aura_container').hover(function(){
        $('#detail').dialog({position: {my: "left top", at: "right top", of: $(this)}});
        $("#detail .detail_container").html("");

        var charObj = mGridToChar[getGridByUi($(this))];
        var aura = charObj.aura;
        var text = mStringData[aura.target] + "<br>";
        var auraText = [];
        $.each(getAuraEffectByLink(aura.effect, charObj.c.link), function(key, val) {
            if (key == "cooldownTime") {
                var tKey = key + "Aura";
                auraText.push(mStringData[tKey] + val + "%");
            } else {
                auraText.push(mStringData[key] + val + "%");
            }
        });
        text = text + auraText.join(", ");
        $("#detail .detail_container").html(text);
        $('#detail').dialog("open");
    }, function(){
        $('#detail').dialog("close");
    });

    $('.char .skill_control_container').hover(function(){
        var texts = getSkillDetail(getGridByUi($(this)));

        $('#detail').dialog({position: {my: "left top", at: "right top", of: $(this)}});
        $("#detail .detail_container").html("");
        $("#detail .detail_container").html(texts.join("<br>"));
        $('#detail').dialog("open");
    }, function(){
        $('#detail').dialog("close");
    });

    $('.fairy_control_container .skill_control_label').hover(function(){
        var texts = getFairySkillDetail(mFairy);

        $('#detail').dialog({position: {my: "left top", at: "right top", of: $(this)}});
        $("#detail .detail_container").html("");
        $("#detail .detail_container").html(texts.join("<br>"));
        $('#detail').dialog("open");
    }, function(){
        $('#detail').dialog("close");
    });

    $('.fairy_control_container .mastery').hover(function(){
        if (mFairy.mastery != null) {
            var texts = getFairyMasteryDetail(mFairy);

            $('#detail').dialog({position: {my: "left top", at: "right top", of: $(this)}});
            $("#detail .detail_container").html("");
            $("#detail .detail_container").html(texts.join("<br>"));
            $('#detail').dialog("open");
        }
    }, function(){
        $('#detail').dialog("close");
    });

    $('.calculate').click(function() {
        $('#detailCalculate').dialog("open");
        var data = calculateBattle();

        Highcharts.chart('detailCalculateContainer', {
            title: {
                text: mStringData["calculateTitle"]
            },
            tooltip: {
                shared: true,
                formatter: function() {
                    var s = '<b>'+ this.x +'</b>';
                    var t = 0;
                    $.each(this.points, function(i, point) {
                        s += '<br><span style="color:' + point.color + '">\u25CF</span> ' + point.series.name + ': <b>' + point.y + '</b><br/>';
                        t += point.y;
                    });
                    s += '<br>' + mStringData.total + ': <b>' + t + '</b>';

                    return s;
                }
            },
            xAxis: {
                categories: data.x,
                title: {
                    text: mStringData["second"]}
            },
            yAxis: {
                title: {
                    align: 'high',
                    offset: 0,
                    text: mStringData["dmg"],
                    rotation: 0,
                    y: -10}},
            exporting: {enabled: false},
            series: data.y
        });
    });

    $('.picker_char_container .attr').change(function() {
        var v = $(this).val();
        if (v == "") v = null;
        updatePickerByType(mPickerType, v);
    });

    $('.skill_all').change(function() {
        var state = $(this).prop("checked");
        $(".skill_control").filter(function(i, x) {
            return $(x).prop("disabled") == false;
        }).each(function(i, x) {
            var elementState = $(x).prop("checked");
            if (state ^ elementState) $(x).prop("checked", state).change();
        });
    });

    $('.friendship').click(function() {
        var friendship = $(this).attr("value");
        $(this).html("");
        if (friendship == NONE_FRIENDLY) {
            $(this).attr("value", FRIENDLY);
            $('<img>').attr("src", FRIENDLY_SRC).appendTo($(this));
        } else if (friendship == FRIENDLY) {
            $(this).attr("value", MARRIED);
            $('<img>').attr("src", MARRIED_SRC).appendTo($(this));
        } else if (friendship == MARRIED) {
            $(this).attr("value", NONE_FRIENDLY);
            $('<img>').attr("src", NONE_FRIENDLY_SRC).appendTo($(this));
        }
        updateCharObs();
        updatePerformance();
    });

    $('.update_log').html(mStringData["last_update"] + " " + mUpdate[0].date.yyyymmdd());
    $('.update_log').click(function() {
        $('#updateDialog').dialog("open");
    });

    $('.select_fairy').click(function() {
        openPickerFairyDialog();
    });

    $(".fairy_container .fairy_control_container .fairy").click(function() {
        openPickerFairyDialog();
    });

    //debugChar();
}

function getSkillDetail(grid) {
    var charObj = mGridToChar[grid];
    var skill = charObj.skill;

    if ('detailText' in skill) {
        var text = [];
        text.push(mStringData.firstCooldownTime.format(getSkillFirstCooldownTime(charObj)));
        text.push(mStringData.cooldownTime.format(getSkillCooldownTime(charObj.skill, charObj.c.skillLevel, charObj.c.cooldownTimeReduction)));
        if (charObj.id != "102") {
            text.push(getCharSkillDetail(charObj));
        } else {
            var skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
            var skillEffect2 = getSkillByLevel(skill.effect2, charObj.c.skillLevel);
            text.push(skill.detailText.val.format(skillEffect.dodge.val, Math.abs(skillEffect.dmg.val), skillEffect2.dmg.val, Math.abs(skillEffect2.dodge.val)));
        }
        return text;
    } else {
        return getSkillDetailNormal(charObj);
    }
}

function getSkillDetailNormal(charObj) {
    var skill = charObj.skill;
    var skillTarget = skill.target;
    var skillType = skill.type;
    var text = [];
    var skillList = ['effect', 'effectNight'];
    for (var i in skillList) {
        var skillEffect = "";
        if (skillList[i] == "effectNight" && 'effectNight' in skill) {
            skillEffect = getSkillByLevel(skill.effectNight, charObj.c.skillLevel);
            text.push("");
            text.push(mStringData["night"]);
        }
        if (skillList[i] == "effect" && 'effect' in skill) {
            skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
            if ('effectNight' in skill) {
                text.push(mStringData["day"]);
            }
        }

        if (skillEffect != "") {
            if (skillType != "passive") {
                text.push(mStringData.firstCooldownTime.format(getSkillFirstCooldownTime(charObj)));
                text.push(mStringData.cooldownTime.format(getSkillCooldownTime(charObj.skill, charObj.c.skillLevel, charObj.c.cooldownTimeReduction)));
                if ('skillTimes' in charObj.skill) {
                    text.push(mStringData.skillTimes.format(charObj.skill.skillTimes));
                }
            }
            $.each(skillEffect, function(key, val) {
                var tSkillType = skillType;
                var tSkillTarget = skillTarget;
                if ('type' in val) tSkillType = val.type;
                if ('target' in val) tSkillTarget = val.target;

                var s = "";
                if ('everyChangeBelt' in charObj.skill) {
                    s += mStringData.everyChangeBelt;
                }
                if ('everyAttack' in charObj.skill) {
                    s += mStringData.everyAttack;
                }
                if (isBuffAttrPercent(key)) {
                    s += "[" +mStringData[tSkillType] + "]";
                    s += mStringData[tSkillTarget] + mStringData[key] + val.val + "%";
                    text.push(s);
                } else if (key == "time") {
                    text.push(mStringData["time"].format(val.val));
                } else if (key == "attack" || key == "attackDot" || key == "attackTimes") {
                    if ('prepareTime' in charObj.skill) {
                        s += mStringData.prepareTime.format(charObj.skill.prepareTime);
                    }
                    if ('everyAttackTimesOnNext' in charObj.skill) {
                        s += mStringData.everyAttackTimesOnNext.format(charObj.skill.everyAttackTimesOnNext);
                    }

                    if (key == "attackDot") {
                        text.push(s + mStringData[key].format(val.everyTime, val.val));
                    } else if (key == "attack") {
                        s += mStringData[key].format(val.val);
                        if ('attackToArmor' in val) {
                            s += "/" + mStringData["attackToArmor"].format(val["attackToArmor"]);
                        }
                        if ('extraToTarget' in val) {
                            s += "/" + mStringData["extraToTarget"] + mStringData[key].format(val["extraToTarget"]);
                        }
                        text.push(s);
                    } else {
                        text.push(s + mStringData[key].format(val.val));
                    }
                } else if (key == "extraAttack") {
                    s += mStringData.rate.format(val.rate) + mStringData.extraAttack + mStringData.criAttack;
                    text.push(s);
                } else if (key == "criAttack") {
                    s += mStringData.criAttack;
                    text.push(s);
                } else if (key == "belt") {
                    s += mStringData.addBelt.format(val.val);
                    text.push(s);
                }
            });
        }
    }

    return text;
}

function getGridByUi(e) {
    return getGridByUIValue(getUiElementGridValue(e));
}

function getUiElementGridValue(e) {
    return e.attr("grid_value");
}

function getGridUiObj(grid) {
    return $("." + mGridToUI[grid]);
}

function initDialog() {
    $('#picker').dialog({autoOpen: false, width: 'auto', modal : true});
    $('#picker_equipment').dialog({autoOpen: false, width: 'auto', modal : true});
    $('#picker_by_type').dialog({autoOpen: false, width: 'auto', modal : true});
    $('#picker_by_type').dialog({position: {my: "left top", at: "right top", of: ".formation"}});
    $('#picker_equipment').dialog({position: {my: "left top", at: "right top", of: ".formation"}});
    $('#picker_fairy').dialog({autoOpen: false, width: 'auto', modal : true});
    $('#picker_fairy').dialog({position: {my: "left top", at: "right top", of: ".formation"}});
    $('#detail').dialog({autoOpen: false, width: 'auto'});
    $('#detailCalculate').dialog({autoOpen: false, width: 'auto', modal : true});
    $('#detailCalculate').on('dialogclose', function(event) {
        mIsDetailCalculate = false;
    });
    $('#detailCalculate').on('dialogopen', function(event) {
        mIsDetailCalculate = true;
    });
    $('#updateDialog').dialog({autoOpen: false, width: 'auto', modal : true});
    $('#updateDialog').dialog({position: {my: "left bottom", at: "left top", of: ".update_log"}});

    var row = $('<tr></tr>');
    for (var i in TYPES) {
        var v = TYPES[i];
        var item = $('<div></div>').addClass("pick_button hover").html(v).attr("value", v).click(function() {
            openDialogPickerByType($(this).attr("value"));
        });
        $('<td></td>').append(item).appendTo(row);
    }

    $('#picker table').append(row);

    $('#picker .remove').click(function() {
        removeChar(mPickerGrid);
    });

    $('#picker_equipment .remove').click(function() {
        removeEquipment(mPickerGrid, mPickerEquipmentIndex);
    });

    $('#picker_fairy .remove').click(function() {
        removeFairy();
    });

    mUpdate.forEach(function(v) {
        $('#updateDialog .text').append(v.date.yyyymmdd());
        $('#updateDialog .text').append("<br>");
        $('#updateDialog .text').append(v.log.join("<br>"));
        $('#updateDialog .text').append("<br>");
        $('#updateDialog .text').append("<br>");
    });
}

function openPickerFairyDialog() {
    updatePickerFairy();
    $('#picker_fairy').dialog("open");
}

function closePickerFairyDialog() {
    $('#picker_fairy').dialog("close");
}

function removeChar(grid) {
    $("." + mGridToUI[grid] + " .add_button").show();
    $("." + mGridToUI[grid] + " .char").hide();

    $('#picker').dialog("close");
    mGridToChar[grid] = "";
    updateCharObs();

    var g = getGridUiObj(grid).attr("grid_value");
    mGridHasChar = $.grep(mGridHasChar, function(e) {return e != g;});
    updatePerformance();
}

function removeEquipment(grid, equipmentIndex) {
    $('#picker_equipment').dialog("close");

    var charObj = mGridToChar[grid];
    charObj.equipment[equipmentIndex] = "";
    updateEquipmentUI(charObj);

    updateCharObs();
    updatePerformance();
}

function initFormation() {
    mGridOrder.push(["7", "8", "9"]);
    mGridOrder.push(["4", "5", "6"]);
    mGridOrder.push(["1", "2", "3"]);
    for (var i in mGridOrder) {
        var row = $('<tr></tr>');

        for (var j in mGridOrder[i]) {
            var order = mGridOrder[i][j];
            var item = $('.factory .grid_container').clone().addClass("grid_container_" + order).attr("grid_value", order)
                    .find(".add_button").attr("grid_value", order).end()
                    .find(".img").attr("grid_value", order).end()
                    .find(".level").attr("grid_value", order).end()
                    .find(".skill_level").attr("grid_value", order).end()
                    .find(".skill_control").attr("grid_value", order).end()
                    .find(".aura_container").attr("grid_value", order).end()
                    .find(".skill_control_container").attr("grid_value", order).end()
                    .find(".equipment").attr("grid_value", order).end()
                    .find(".equipment_1").attr("equipment_index", "1").end()
                    .find(".equipment_2").attr("equipment_index", "2").end()
                    .find(".equipment_3").attr("equipment_index", "3").end()
                    .find(".char").attr("grid_value", order).end();
            $('<td></td>').addClass("grid").append(item).appendTo(row);

            mGridToUI[order] = "grid_container_" + order;
            mGridToChar[order] = "";
        }

        $('.tab_formation .formation').append(row);
    }

    for (var i = 1; i <= 5; i++) {
        var item = $('.factory .char_performance').clone().addClass("char_performance_" + i);
        $('.performance_container').append(item);
    }

    var masterySelect = $('.fairy_control_container .mastery');
    $.each(mFairyData.mastery, function(key, val) {
        masterySelect.append(
                $("<option></option>").attr("value", val.id).text(val.name));
    });
}

function swapGridUI(a, b) {
    var aClass = "";
    a.classes(function(c) {
        if (c.includes("grid_container_")) {
            aClass = c;
        }
    });

    var bClass = "";
    b.classes(function(c) {
        if (c.includes("grid_container_")) {
            bClass = c;
        }
    });

    swapArrayElements(mGridToChar, mGridToUI.indexOf(aClass), mGridToUI.indexOf(bClass));
    swapArrayElements(mGridToUI, mGridToUI.indexOf(aClass), mGridToUI.indexOf(bClass));
}

function openDialogPicker(grid) {
    mPickerGrid = getGridByUIValue(grid);
    $('#picker').dialog("open");
    $('#picker').dialog({position: {my: "left top", at: "center", of: ".grid_container_" + grid}});
    $('#picker_by_type').dialog("close");
}

function getGridByUIValue(v) {
    return mGridToUI.indexOf("grid_container_" + v);
}

function openDialogPickerByType(type) {
    mPickerType = type;
    $('#picker_by_type').dialog("open");
    $('#picker').dialog("close");
    $('.picker_char_container .attr').val("");
    updatePickerByType(type, null);
}

function updatePickerByType(type, auraAttr) {
    for (var i in CHAR_RARITY_LISTS) {
        var nowVal = CHAR_RARITY_LISTS[i];
        var count = 0;
        var rows = [];
        var row = $('<tr></tr>');
        var grepList = $.grep(mCharData, function(e) {
            var result = e.type == type && e.rarity == nowVal;
            if (auraAttr != null) {
                result &= auraAttr in e.aura.effect;
            }
            return result;
        });
        grepList.forEach(function(v) {
            var item = $('<div></div>').addClass("pick_button hover rarity_"+nowVal).html(v.name).attr("value", v.id).click(function() {
                addChar(mPickerGrid, $(this).attr("value"));
            });

            $('<td></td>').append(item).appendTo(row);

            count++;
            if (count % 5 == 0) {
                rows.push(row);
                row = $('<tr></tr>');
                count = 0;
            }
        });
        rows.push(row);

        $("#picker_by_type .rarity_"+nowVal+" table").html("");
        $("#picker_by_type .rarity_"+nowVal+" table").append(rows);
    }
}

function isFairyExtra(id) {
    return /^([0-9]{4,})$/.test(id);
}

function updatePickerFairy() {
    for (var i in FAIRY_TYPE) {
        var grepList = $.grep(mFairyData.fairy, function(e) {
            return e.type == FAIRY_TYPE[i];
        });
        var items = [];
        grepList.forEach(function(v) {
            var buttonClass = "pick_button hover "+FAIRY_TYPE[i];
            if (isFairyExtra(v.id)) {
                buttonClass += " " + EXTRA;
            }
            var item = $('<div></div>').addClass(buttonClass).html(v.name).attr("value", v.id).click(function() {
                addFairy($(this).attr("value"));
            });
            items.push(item);
        });

        var count = 0;
        var rows = [];
        var row = $('<tr></tr>');
        items.forEach(function(v) {
            $('<td></td>').append(v).appendTo(row);

            count++;
            if (count % 5 == 0) {
                rows.push(row);
                row = $('<tr></tr>');
                count = 0;
            }
        });
        rows.push(row);

        $("#picker_fairy ."+FAIRY_TYPE[i]+" table").html("");
        $("#picker_fairy ."+FAIRY_TYPE[i]+" table").append(rows);
    }
}

function getFairy(id) {
    var grepList = $.grep(mFairyData.fairy, function(e){return e.id == id;});
    var fairy = copyObject(grepList[0]);
    fairy.thisType = "fairy";

    return fairy;
}

function addFairy(id) {
    mFairy = getFairy(id);

    $(".fairy_container .select_fairy").hide();
    $(".fairy_container .fairy_control_container").show();
    $(".fairy_container .fairy_control_container .fairy").html(mFairy.name);
    $(".fairy_container .fairy_control_container .fairy").removeClass(FAIRY_TYPE.join(" ") + " " + EXTRA);
    $(".fairy_container .fairy_control_container .fairy").addClass(mFairy.type);
    if (isFairyExtra(id)) {
        $(".fairy_container .fairy_control_container .fairy").addClass(EXTRA);
    }
    closePickerFairyDialog();
    updateFairy();
    updateCharObs();
    updatePerformance();
}

function getMastery(id) {
    if (id == "0") return null;
    var grepList = $.grep(mFairyData.mastery, function(e){return e.id == id;});
    return copyObject(grepList[0]);
}

function updateFairy() {
    var fairyControlContainer = $(".fairy_container .fairy_control_container");
    mFairy.level = parseInt(fairyControlContainer.find(".level").val());
    mFairy.rarity = fairyControlContainer.find(".rarity").val();
    mFairy.isUseSkill = fairyControlContainer.find(".skill_control").is(":checked");
    mFairy.skillLevel = parseInt(fairyControlContainer.find(".skill_level").val());
    mFairy.mastery = getMastery(fairyControlContainer.find(".mastery").val());
    mFairy.aura = {};

    mFairy.aura.dmg =
            (Math.ceil(mFairyData.initRatio.dmg * mFairy.partyAura.dmg) + Math.ceil(mFairyData.growRatio.dmg * mFairy.partyAura.dmg * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.hit =
            (Math.ceil(mFairyData.initRatio.hit * mFairy.partyAura.hit) + Math.ceil(mFairyData.growRatio.hit * mFairy.partyAura.hit * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.dodge =
            (Math.ceil(mFairyData.initRatio.dodge * mFairy.partyAura.dodge) + Math.ceil(mFairyData.growRatio.dodge * mFairy.partyAura.dodge * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.armor =
            (Math.ceil(mFairyData.initRatio.armor * mFairy.partyAura.armor) + Math.ceil(mFairyData.growRatio.armor * mFairy.partyAura.armor * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.criDmg =
            (Math.ceil(mFairyData.initRatio.criDmg * mFairy.partyAura.criDmg) + Math.ceil(mFairyData.growRatio.criDmg * mFairy.partyAura.criDmg * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
}

function removeFairy() {
    mFairy = null;
    $(".fairy_container .select_fairy").show();
    $(".fairy_container .fairy_control_container").hide();
    closePickerFairyDialog();
    updateCharObs();
    updatePerformance();
}

function initData() {
    $.ajaxSetup({
        async: false
    });
    $.getJSON("char.json", function(data) {
        $.each(data.chars, function(key, val) {
            mCharData.push(val);
        });
    }).fail(function() {
        alert("load json data fail");
    });

    $.getJSON("equipment.json", function(data) {
        mEquipmentData = data;
    }).fail(function() {
        alert("load json data fail");
    });
    $.getJSON("string.json", function(data) {
        mStringData = data.string;
    }).fail(function() {
        alert("load json data fail");
    });
    $.getJSON("update.json", function(data) {
        $.each(data.update, function(key, val) {
            var msec = Date.parse(val.date);
            val.date = new Date(msec);
            mUpdate.push(val);
        });
    }).fail(function() {
        alert("load json data fail");
    });
    mUpdate.sort(compare);

    $.getJSON("fairy.json", function(data) {
        mFairyData = data;
    }).fail(function() {
        alert("load json data fail");
    });
}

function compare(a,b) {
    if (a.date < b.date)
        return 1;
    else
        return -1;
    return 0;
}

function addChar(grid, id) {
    $('#picker_by_type').dialog("close");
    $('#picker').dialog("close");

    mGridToChar[grid] = getChar(id);

    $("." + mGridToUI[grid] + " .add_button").hide();
    $("." + mGridToUI[grid] + " .char .img").html(getCharImgUIObj(id));
    if (mGridToChar[grid].skill.type == "passive") {
        $("." + mGridToUI[grid] + " .char .skill_control").prop("disabled", true);
        $("." + mGridToUI[grid] + " .char .skill_control").prop("checked", true);
    } else {
        $("." + mGridToUI[grid] + " .char .skill_control").prop("disabled", false);
        $("." + mGridToUI[grid] + " .char .skill_control").prop("checked", false);
        $(".skill_all").prop("checked", false);

        if ('stack' in mGridToChar[grid].skill && mGridToChar[grid].skill.stack) {
            $("." + mGridToUI[grid] + " .char .skill_stack").show();
        } else {
            $("." + mGridToUI[grid] + " .char .skill_stack").hide();
        }
    }
    if ($('.view_equipment').is(":checked")) {
        $("." + mGridToUI[grid] + " .char").hide();
        $("." + mGridToUI[grid] + " .equipment_container").show();
    } else {
        $("." + mGridToUI[grid] + " .char").show();
        $("." + mGridToUI[grid] + " .equipment_container").hide();
    }

    var auraUI = $("." + mGridToUI[grid] + " .aura_container");
    updateCharObs();
    updateAuraUI(auraUI, mGridToChar[grid]);
    updateEquipmentUI(mGridToChar[grid]);

    var g = getGridUiObj(grid).attr("grid_value");
    if (mGridHasChar.indexOf(g) >= 0) {

    } else {
        mGridHasChar.push(g);
    }
    updatePerformance();
}

function updateEquipmentUIByGrid(grid) {
    var g = getGridByUIValue(grid);
    updateEquipmentUI(getCharObjByGrid(g));
}

function getEquipmentById(id) {
    var grepList = $.grep(mEquipmentData.equipment, function(e){return e.id == id;});
    return grepList[0];
}

function updateEquipmentUI(charObj) {
    var charType = charObj.type;
    var charLevel = charObj.c.level;
    var classificationList = getEquipmentClassificationOfChar(charObj);

    for (var i in CHAR_LEVEL_EQUIPMENT) {
        var ii = i*1 + 1;
        if (charLevel >= CHAR_LEVEL_EQUIPMENT[i]) {
            var text = mStringData[classificationList[ii]];
            if (charObj.equipment[ii] != "") {
                text = getEquipmentById(charObj.equipment[ii]).name;
            }
            charObj.ui.equipmentUI.find(".equipment_"+ii).html(text).click(function() {
                openDialogPickerEquipment($(this).attr("equipment_index"), $(this).attr("grid_value"));
            });
        } else {
            charObj.ui.equipmentUI.find(".equipment_"+ii).html("Lv."+CHAR_LEVEL_EQUIPMENT[i]+mStringData.unlock).off('click');
        }
    }
}

function openDialogPickerEquipment(index, grid) {
    mPickerGrid = getGridByUIValue(grid);
    mPickerEquipmentIndex = index;
    $('#picker_equipment').dialog("open");
    var equipmentUI = $("." + mGridToUI[mPickerGrid] + " .equipment_container");
    var charObj = mGridToChar[mPickerGrid];

    var charType = charObj.type;
    var charLevel = charObj.c.level;
    var classificationList = getEquipmentClassificationOfChar(charObj);

    var classification = classificationList[mPickerEquipmentIndex];

    var grepList = $.grep(mEquipmentData.equipment_type, function(e){
        var isSameClassification = e.classification == classification;
        if (!isSameClassification) return false;
        if ('can_char' in e) {
            if (e["can_char"].indexOf(charObj.id) >= 0) {
                return true;
            }
        }
        if ('can_type' in e) {
            if (e["can_type"].indexOf(charObj.type) >= 0 || e["can_type"].indexOf("all") >= 0) {
                return true;
            } else {
                return false;
            }
        }
        if ('can_not_type' in e) {
            if (e["can_not_type"].indexOf(charObj.type) >= 0) {
                return false;
            } else {
                return true;
            }
        }
        return true;
    });

    var equipmentTypeList = $.map(grepList, function(item) {
        return item.type;
    });

    var alreadyEquipmentTypeList = [];
    for (var i = 1; i <= 3; i++) {
        if (charObj.equipment[i] != "" && i != mPickerEquipmentIndex) {
            alreadyEquipmentTypeList.push(getEquipmentById(charObj.equipment[i]).type);
        }
    }

    equipmentTypeList = $.grep(equipmentTypeList, function(v) {
        for (var i in alreadyEquipmentTypeList) {
            if (alreadyEquipmentTypeList[i] == v) {
                return false;
            }
        }
        return true;
    });

    grepList = $.grep(mEquipmentData.equipment, function(e){
        var isSameType = equipmentTypeList.indexOf(e.type) >= 0;
        var canLevel = 1;
        if (e.rarity == "3") canLevel = 30;
        if (e.rarity == "4") canLevel = 45;
        if (e.rarity == "5") canLevel = 60;
        var isCanLevel = charObj.c.level >= canLevel;
        if ('can_char' in e) {
            return e["can_char"].indexOf(charObj.id) >= 0 && isSameType && isCanLevel;
        } else {
            return isSameType && isCanLevel;
        }
    });

    var equipmentList = grepList;

    for (var i = 5; i >= 2; i--) {
        var count = 0;

        var rows = [];
        var row = $('<tr></tr>');
        grepList = $.grep(equipmentList, function(e) {return e.rarity == i;});
        grepList.forEach(function(v) {
            var item = $('<div></div>').addClass("pick_button hover rarity_"+i).html(v.name).attr("value", v.id).click(function() {
                addEquipment(mPickerGrid, mPickerEquipmentIndex, $(this).attr("value"));
                $('#picker_equipment').dialog("close");
            });

            $('<td></td>').append(item).appendTo(row);

            count++;
            if (count % 5 == 0) {
                rows.push(row);
                row = $('<tr></tr>');
                count = 0;
            }
        });
        rows.push(row);

        $("#picker_equipment .rarity_"+i+" table").html("");
        $("#picker_equipment .rarity_"+i+" table").append(rows);
    }
}

function addEquipment(grid, equipmentIndex, id) {
    var charObj = mGridToChar[grid];
    charObj.equipment[equipmentIndex] = id;
    updateEquipmentUI(charObj);

    updateCharObs();
    updatePerformance();
}

function getCharObjByGrid(grid) {
    return mGridToChar[grid];
}

function getEquipmentClassificationOfChar(charObj) {
    var classificationList = "";
    var grepList = $.grep(mEquipmentData.char_can_equipment_type, function(e){return e.type == charObj.type;});
    classificationList = grepList[0];

    grepList = $.grep(mEquipmentData.char_can_equipment_type, function(e){return e.char == charObj.id;});
    if (grepList.length > 0) {
        classificationList = grepList[0];
    }

    return classificationList.classification_type;
}

function updateAuraUI(auraUI, charObj) {
    grids = getAuraGridFromChar(charObj);
    var selfGrid = 5;
    if ('self' in charObj.aura) {
        selfGrid = getGridFromXY(charObj.aura["self"]);
    }

    for (var i = 1; i <= 9; i++) {
        if (grids.indexOf(i) >= 0) {
            auraUI.find(".aura_" + i).css("background-color", "#00FFDC");
        } else if (i == selfGrid) {
            auraUI.find(".aura_" + i).css("background-color", "white");
        } else {
            auraUI.find(".aura_" + i).css("background-color", "#6A6A6A");
        }
    }
}

function getGridFromXY(val) {
    var grid = 0;
    if (val.x == "0" && val.y == "0") {
        grid = 5;
    }
    if (val.x == "0" && val.y == "1") {
        grid = 2;
    }
    if (val.x == "0" && val.y == "-1") {
        grid = 8;
    }
    if (val.x == "1" && val.y == "0") {
        grid = 6;
    }
    if (val.x == "1" && val.y == "1") {
        grid = 3;
    }
    if (val.x == "1" && val.y == "-1") {
        grid = 9;
    }
    if (val.x == "-1" && val.y == "0") {
        grid = 4;
    }
    if (val.x == "-1" && val.y == "1") {
        grid = 1;
    }
    if (val.x == "-1" && val.y == "-1") {
        grid = 7;
    }

    return grid;
}

function xyToGrid(x, y) {
    var grid = -1;
    if (x == "0" && y == "0") {
        grid = 5;
    }
    if (x == "0" && y == "1") {
        grid = 2;
    }
    if (x == "0" && y == "-1") {
        grid = 8;
    }
    if (x == "1" && y == "0") {
        grid = 6;
    }
    if (x == "1" && y == "1") {
        grid = 3;
    }
    if (x == "1" && y == "-1") {
        grid = 9;
    }
    if (x == "-1" && y == "0") {
        grid = 4;
    }
    if (x == "-1" && y == "1") {
        grid = 1;
    }
    if (x == "-1" && y == "-1") {
        grid = 7;
    }

    return grid;
}

function getAuraGridFromChar(charObj) {
    var grids = [];
    $.each(charObj.aura.grid, function(key, val) {
        grids.push(getGridFromXY(val));
    });

    return grids;
}

function getCharImgUIObj(id) {
    var img = $('<img>').attr("src","assets/n/" + id + ".png");
    return img;
}

function updatePerformance() {
    var index = 1;
    var dpsSum = 0;
    for (var i in mGridHasChar) {
        var grid = getGridByUIValue(mGridHasChar[i]);
        if (mGridToChar[grid] != "") {
            var charObj = mGridToChar[grid];

            var skillAttack = "-";
            if (charObj.cb.skillAttack != 0) {
                skillAttack = charObj.cb.skillAttack.toFixed(2);
            }

            var cp = $(".char_performance_" + index);
            cp.find(".value").html("-").end()
            .find(".value.name").html(charObj.name).end()
            .find(".value.hp").html(charObj.cb.hp).end()
            .find(".value.dmg").html(charObj.cb.attr.dmg).end()
            .find(".value.hit").html(charObj.cb.attr.hit).end()
            .find(".value.dodge").html(charObj.cb.attr.dodge).end()
            .find(".value.fireOfRate").html(charObj.cb.attr.fireOfRate).end()
            .find(".value.attackFrame").html(charObj.cb.attr.attackFrame).end()
            .find(".value.criRate").html(charObj.cb.attr.criRate).end()
            .find(".value.criDmg").html(charObj.cb.attr.criDmg + "%").end()
            .find(".value.skillAttack").html(skillAttack).end()
            .find(".value.armorPiercing").html(charObj.c.armorPiercing).end()
            .find(".value.belt").html(charObj.cb.belt).end()
            .find(".value.dps").html(charObj.cb.attr.dps.toFixed(2)).end()
            .find(".value.armor").html(charObj.cb.attr.armor).end();

            dpsSum += charObj.cb.attr.dps;
            index++;
        }
    }

    $(".value.dpsSum").html("-");
    if (dpsSum > 0) {
        $(".value.dpsSum").html(dpsSum.toFixed(2));
    }

    while (index <= 5) {
        var cp = $(".char_performance_" + index);
        cp.find(".value").html("-").end();
        index++;
    }

    if (mFairy != null) {
        $(".fairy_performance").find(".value.dmg").html(mFairy.aura.dmg.toFixed(1) + "%").end()
            .find(".value.hit").html(mFairy.aura.hit.toFixed(1) + "%").end()
            .find(".value.dodge").html(mFairy.aura.dodge.toFixed(1) + "%").end()
            .find(".value.armor").html(mFairy.aura.armor.toFixed(1) + "%").end()
            .find(".value.criDmg").html(mFairy.aura.criDmg.toFixed(1) + "%").end();
    } else {
        $(".fairy_performance").find(".value").html("-");
    }

    var preLoadCode = {};
    var formation = [];
    var fairy = {};
    for (var i in mGridHasChar) {
        var grid = getGridByUIValue(mGridHasChar[i]);
        if (mGridToChar[grid] != "") {
            var charObj = mGridToChar[grid];

            var charRow = {};
            charRow.g = grid;
            charRow.id = charObj.id;
            charRow.lv = charObj.c.level;
            charRow.slv = charObj.c.skillLevel;
            charRow.eq = charObj.equipment_code;
            formation.push(charRow);
            index++;
        }
    }

    if (mFairy != null) {
        fairy.id = mFairy.id;
        fairy.lv = mFairy.level;
        fairy.r = mFairy.rarity;
        fairy.slv = mFairy.skillLevel;
        fairy.m = mFairy.mastery.id;
    }
    preLoadCode["char"] = formation;
    preLoadCode["fairy"] = fairy;

    var url = [location.protocol, '//', location.host, location.pathname].join('');
    $("#code").val(url + "?pre=" + JSON.stringify(preLoadCode));
}

function charGetAttrByLevel(attr, lv) {
    var v = ((1.0 * attr["100"] - 1.0 * attr["1"]) / 99 * (lv - 1) + attr["1"] * 1.0);
    return parseInt(v.toFixed(0));
}

function copyObject(o) {
    if ('thisType' in o && o.thisType == "char" && 'ui' in o) {
        var t = o.ui;
        o.ui = {};
        var result = JSON.parse(JSON.stringify(o));
        o.ui = t;
        return result;
    }
    return JSON.parse(JSON.stringify(o));
}

function getChar(id){
    var grepList = $.grep(mCharData, function(e){return e.id == id;});
    var obj = JSON.parse(JSON.stringify(grepList[0]));
    obj["criRate"] = 20;
    obj["criDmg"] = 50;
    obj["movementSpeed"] = 150;
    obj["equipment"] = [];
    obj["equipment"][1] = "";
    obj["equipment"][2] = "";
    obj["equipment"][3] = "";
    obj.thisType = "char";
    if (obj.type == "rf" || obj.type == "sg") obj["criRate"] = 40;
    if (obj.type == "smg" || obj.type == "mg") obj["criRate"] = 5;
    if (obj.id == "114") obj["criRate"] = 40;
    if (obj.id == "172") obj["criRate"] = 30;
    return obj;
}

function gridToUi(grid, elementName) {
    if (elementName != null) {
        return getGridUiObj(grid).find("."+elementName);
    }
    return getGridUiObj(grid);
}

function updateCharObsForBase() {
    for (var i in GRIDS) {
        if (mGridToChar[GRIDS[i]] != "") {
            var charObj = mGridToChar[GRIDS[i]];

            charObj.ui = {};
            charObj.ui.controlUI = gridToUi(GRIDS[i], CONTROL_CONTAINER);
            charObj.ui.equipmentUI = gridToUi(GRIDS[i], EQUIPMENT_CONTAINER);
            charObj.ui.friendship = gridToUi(GRIDS[i], FRIENDSHIP);

            charObj.c = {};
            charObj.c.selfGrid = parseInt(GRIDS[i]);
            charObj.c.level = parseInt(charObj.ui.controlUI.find(".level").val());
            charObj.c.isUseSkill = charObj.ui.controlUI.find(".skill_control").is(":checked");
            charObj.c.skillStack = parseInt(charObj.ui.controlUI.find(".skill_stack").val());
            charObj.c.skillLevel = parseInt(charObj.ui.controlUI.find(".skill_level").val());
            charObj.c.friendship = charObj.ui.friendship.attr("value");
            charObj.c.link = getLink(charObj.c.level);
            charObj.c.hp = charGetAttrByLevel(charObj.hp, charObj.c.level);
            charObj.c.dmg = charGetAttrByLevel(charObj.dmg, charObj.c.level);

            charObj.c.hit = charGetAttrByLevel(charObj.hit, charObj.c.level);
            charObj.c.dodge = charGetAttrByLevel(charObj.dodge, charObj.c.level);
            charObj.c.fireOfRate = charGetAttrByLevel(charObj.fireOfRate, charObj.c.level);
            charObj.c.criRate = charObj.criRate;
            charObj.c.criDmg = charObj.criDmg;
            charObj.c.movementSpeed = charObj.movementSpeed;
            charObj.c.shield = 0;
            charObj.c.reducedDamage = 1;
            if (charObj.type == "mg") {
                charObj.c.belt = parseInt(charObj.belt);
            }

            if (charObj.type == "sg") {
                charObj.c.armor = charGetAttrByLevel(charObj.armor, charObj.c.level);
            } else {
                charObj.c.armor = 0;
            }

            var friendshipEffect = 0;
            if (charObj.c.friendship == FRIENDLY) friendshipEffect = 0.05;
            if (charObj.c.friendship == MARRIED) friendshipEffect = 0.1;
            charObj.c.dmg = Math.ceil(charObj.c.dmg * (1 + friendshipEffect));
            charObj.c.hit = Math.ceil(charObj.c.hit * (1 + friendshipEffect));
            charObj.c.dodge = Math.ceil(charObj.c.dodge * (1 + friendshipEffect));

            charObj.c.aura_dmg = 0;
            charObj.c.aura_hit = 0;
            charObj.c.aura_dodge = 0;
            charObj.c.aura_fireOfRate = 0;
            charObj.c.aura_criRate = 0;
            charObj.c.aura_cooldownTime = 0;
            charObj.c.aura_armor = 0;
            charObj.c.skillAttack = 0;
            charObj.c.armorPiercing = 10;
            charObj.c.nightSight = 0;

            if (charObj.c.level < 80) charObj.equipment[3] = "";
            if (charObj.c.level < 50) charObj.equipment[2] = "";
            if (charObj.c.level < 20) charObj.equipment[1] = "";
            charObj.equipment_code = [];
            for (var zi = 1; zi <= 3; zi++) {
                if (charObj.equipment[zi] != "") {
                    var eObj = getEquipmentById(charObj.equipment[zi]);
                    var strengthenLevel = parseInt(charObj.ui.equipmentUI.find(".equipment_strengthen_"+zi).val());

                    var eq_code = {};
                    eq_code.i = zi;
                    eq_code.id = charObj.equipment[zi];
                    eq_code.lv = strengthenLevel;
                    charObj.equipment_code.push(eq_code);


                    $.each(eObj.effect, function(key, val) {
                        var strengthenCoefficient = eObj.strengthenCoefficient;
                        if ('strengthenCoefficient' in val) {
                            strengthenCoefficient = val.strengthenCoefficient;
                        }
                        if (val.max > 0) {
                            charObj.c[key] += Math.floor(val.max * 1 * (1 + strengthenLevel * strengthenCoefficient));
                        } else {
                            charObj.c[key] += val.max * 1;
                        }
                    });
                }
            }
        }
    }
}

function getAuraTargetGrid(charObj) {
    var aura = charObj.aura;
    var selfPos = gridToXY(charObj.c.selfGrid);

    var auraSelfX = "0";
    var auraSelfY = "0";
    if ('self' in aura) {
        auraSelfX = aura["self"].x;
        auraSelfY = aura["self"].y;
    }

    var grids = [];
    $.each(aura.grid, function(key, val) {
        var diffX = parseInt(val.x) - parseInt(auraSelfX);
        var diffY = parseInt(val.y) - parseInt(auraSelfY);

        var targetX = selfPos.x + diffX;
        var targetY = selfPos.y + diffY;
        var targetGrid = xyToGrid(targetX, targetY);
        if (targetGrid != -1) {
            grids.push(targetGrid);
        }
    });

    return grids;
}

function updateCharObsForFairyAura() {
    if (mFairy != null) {
        for (var i in GRIDS) {
            if (mGridToChar[GRIDS[i]] != "") {
                var charObj = mGridToChar[GRIDS[i]];

                charObj.c.dmg = Math.floor(charObj.c.dmg * (1 + 0.01 * mFairy.aura.dmg));
                charObj.c.hit = Math.floor(charObj.c.hit * (1 + 0.01 * mFairy.aura.hit));
                charObj.c.dodge = Math.floor(charObj.c.dodge * (1 + 0.01 * mFairy.aura.dodge));
                charObj.c.armor = Math.floor(charObj.c.armor * (1 + 0.01 * mFairy.aura.armor));
                charObj.c.criDmg = Math.floor(charObj.c.criDmg * (1 + 0.01 * mFairy.aura.criDmg));
            }
        }
    }
}

function updateCharObsForAura() {
    for (var i in GRIDS) {
        var grid = GRIDS[i];
        if (mGridToChar[grid] != "") {
            var charObj = mGridToChar[grid];
            var aura = charObj.aura;
            $.each(getAuraTargetGrid(charObj), function(key, val) {
                var targetObj = mGridToChar[val];
                if (targetObj != "" && (targetObj.type == aura.target || aura.target == "all")) {
                    $.each(getAuraEffectByLink(aura.effect, charObj.c.link), function(key, val) {
                        targetObj.c["aura_" + key] += val;
                    });
                }
            });
        }
    }

    for (var i in GRIDS) {
        if (mGridToChar[GRIDS[i]] != "") {
            var charObj = mGridToChar[GRIDS[i]];

            charObj.c.dmg = Math.floor(charObj.c.dmg * (1 + 0.01 * charObj.c.aura_dmg));
            charObj.c.hit = Math.floor(charObj.c.hit * (1 + 0.01 * charObj.c.aura_hit));
            charObj.c.dodge = Math.floor(charObj.c.dodge * (1 + 0.01 * charObj.c.aura_dodge));
            charObj.c.fireOfRate = Math.floor(charObj.c.fireOfRate * (1 + 0.01 * charObj.c.aura_fireOfRate));
            charObj.c.criRate = Math.floor(charObj.c.criRate * (1 + 0.01 * charObj.c.aura_criRate));
            charObj.c.cooldownTimeReduction = Math.min(30, charObj.c.aura_cooldownTime);
            charObj.c.armor = Math.floor(charObj.c.armor * (1 + 0.01 * charObj.c.aura_armor));
        }
    }
}

function updateCharObsForUseSkill() {
    var ally = [];
    var enemy = mEnemy;
    for (var i in GRIDS) {
        if (mGridToChar[GRIDS[i]] != "") {
            var charObj = mGridToChar[GRIDS[i]];
            ally.push(charObj);
        }
    }

    for (var i in ally) {
        var charObj = ally[i];
        var skillType = charObj.skill.type;
        if (charObj.c.isUseSkill) {
            if (skillType == "passive") {
            } else if (skillType == "buff" || skillType == "debuff" || skillType == "activeWithPassive") {
                useSkillForCalculateBattle(charObj, ally, enemy);
            } else if (skillType == "attack") {
                charObj.cb.skillAttack = getSkillAttrValByLevel(charObj, "attack");
                var attackMultiplyExtra = getSkillAttrValByLevel(charObj, "attack", "extraToTarget");
                if (isArmorUnit(enemy)) {
                    var attackToArmor = getSkillAttrValByLevel(charObj, "attack", "attackToArmor");
                    if (attackToArmor != null) charObj.cb.skillAttack = attackToArmor;
                }

                if (attackMultiplyExtra != null) {
                    charObj.cb.skillAttack += attackMultiplyExtra;
                }

                if (charObj.id == "183") {
                    useSkillForCalculateBattle(charObj, ally, enemy);
                }
            }
        } else if (skillType == "activeWithPassive") {
            usePassiveSkillForCalculateBattle(charObj);
        }
    }
}

function updateCharObsForBattle() {
    var battleisNight = $('.battle_control .battleisNight').is(":checked");

    var enemy = mEnemy;
    updateAttrBeforAction(enemy);
    var ally = [];
    for (var i in GRIDS) {
        if (mGridToChar[GRIDS[i]] != "") {
            var charObj = mGridToChar[GRIDS[i]];
            ally.push(charObj);
        }
    }

    for (var i in ally) {
        var charObj = ally[i];
        updateAttrBeforAction(charObj);
        calculateArmorPiercing(charObj, enemy);
        calculateHitRate(charObj, enemy);
        calculateActionDmg(charObj, enemy, PERFORMANCE);
    }
}

function getAttackFrame(charObj) {
    if (charObj.type == "mg") return 11;
    if ('cb' in charObj) {
        return Math.ceil(50.0 * 30.0 / charObj.cb.attr.fireOfRate) - 1;
    } else {
        return Math.ceil(50.0 * 30.0 / charObj.c.fireOfRate) - 1;
    }
}

function getMgChangeBeltFrame(fireOfRate) {
    return (4 + (200 / fireOfRate)) * 30;
}

function getSkillFirstCooldownTime(charObj) {
    return charObj.skill.firstCooldownTime * (1 - charObj.c.cooldownTimeReduction * 0.01);
}

function getAlly() {
    var ally = [];
    for (var i in GRIDS) {
        if (mGridToChar[GRIDS[i]] != "") {
            var charObj = mGridToChar[GRIDS[i]];
            ally.push(charObj);
        }
    }
    return ally;
}

function getSkillAttrValByLevel(charObj, attr, nestedAttr) {
    var battleisNight = $('.battle_control .battleisNight').is(":checked");

    var skill = charObj.skill;
    var skillEffect = "";
    if (battleisNight) {
        if ('effectNight' in skill) {
            skillEffect = getSkillByLevel(skill.effectNight, charObj.c.skillLevel);
        } else if ('effect' in skill) {
            skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
        }
    } else {
        if ('effect' in skill) {
            skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
        }
    }

    if (nestedAttr != null) {
        if (nestedAttr in skillEffect[attr]) {
            return skillEffect[attr][nestedAttr];
        } else {
            return null;
        }
    }

    if (attr in skillEffect) {
        return skillEffect[attr].val;
    } else {
        return null;
    }
}

function usePassiveSkillForCalculateBattle(charObj) {
    var battleisNight = $('.battle_control .battleisNight').is(":checked");

    var skill = charObj.skill;
    var skillEffect = null;
    if (battleisNight) {
        if ('effectNight' in skill) {
            skillEffect = getSkillByLevel(skill.effectNight, charObj.c.skillLevel);
        } else if ('effect' in skill) {
            skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
//            if ('effect2' in skill) {
//                skillEffect = getSkillByLevel(skill.effect2, charObj.c.skillLevel);
//            }
        }
    } else {
        if ('effect' in skill) {
            skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
//            if ('effect2' in skill) {
//                skillEffect = getSkillByLevel(skill.effect2, charObj.c.skillLevel);
//            }
        }
    }

    useSkillForCalculateBattle2(charObj, null, null, skillEffect, CHAR_SKILL);
}

function useSkillForCalculateBattle(charObj, ally, enemy) {
    useSkillForCalculateBattle2(charObj, ally, enemy, getSkillEffects(charObj), CHAR_SKILL);
}

function useSkillForCalculateBattle2(charObj, ally, enemy, skillEffect) {
    useSkillForCalculateBattle2(charObj, ally, enemy, skillEffect, CHAR_SKILL);
}

function getSkillEffects(charObj) {
    var battleisNight = $('.battle_control .battleisNight').is(":checked");

    var skill = charObj.skill;
    var skillEffect = null;
    if (battleisNight) {
        if ('effectNight' in skill) {
            skillEffect = getSkillByLevel(skill.effectNight, charObj.c.skillLevel);
        } else if ('effect' in skill) {
            skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
            if ('effect2' in skill) {
                skillEffect = getSkillByLevel(skill.effect2, charObj.c.skillLevel);
            }
        }
    } else {
        if ('effect' in skill) {
            skillEffect = getSkillByLevel(skill.effect, charObj.c.skillLevel);
            if ('effect2' in skill) {
                skillEffect = getSkillByLevel(skill.effect2, charObj.c.skillLevel);
            }
        }
    }

    return skillEffect;
}

function useFairyMasteryForCalculateBattle(fairy, ally) {
    if (fairy.mastery == null) return;
    var skillEffect = getSkillByLevel(fairy.mastery.effect, null);

    useSkillForCalculateBattle2(fairy, ally, null, skillEffect, FAIRY_MASTERY);
}

function useFairySkillForCalculateBattle(fairy, ally, enemy) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, mFairy.skillLevel);

    useSkillForCalculateBattle2(fairy, ally, enemy, skillEffect, FAIRY_SKILL);
}

function useFortressForCalculateBattle(ally, fortressLevel) {
    var fortressFairy = getFairy("14");
    var skillEffect = getSkillByLevel(fortressFairy.skill.effect, fortressLevel);

    useSkillForCalculateBattle2(fortressFairy, ally, null, skillEffect, FORTRESS);
}

function useSkillForCalculateBattle2(obj, ally, enemy, skillEffect, skillUsedBy) {
    charObj = obj;
    var skill = null;
    var skillTarget = null;
    var skillType = null;
    var skillName = null;
    if (skillUsedBy == CHAR_SKILL) {
        skill = charObj.skill;
        skillTarget = skill.target;
        skillType = skill.type;
        skillName = skill.name;
    } else if (skillUsedBy == FAIRY_MASTERY) {
        skillTarget = obj.mastery.target;
        skillType = "buff";
        skillName = obj.mastery.name;
    } else if (skillUsedBy == FAIRY_SKILL) {
        skill = charObj.skill;
        skillTarget = skill.target;
        skillType = skill.type;
        skillName = skill.name;
    } else if (skillUsedBy == FORTRESS) {
        skill = charObj.skill;
        skillType = BUFF;
        skillTarget = ALLY;
        skillName = skill.name;
    }

    if (skillEffect != null) {
        $.each(skillEffect, function(key, val) {
            var tSkillType = skillType;
            var tSkillTarget = skillTarget;
            var tSkill = {};
            tSkill[key] = copyObject(val);
            tSkill[key].name = skillName;
            tSkill[key].stack = 1;
            if (skillUsedBy == CHAR_SKILL && !mIsDetailCalculate && 'stack' in skill && skill.stack) tSkill[key].stack = charObj.c.skillStack;
            if ('type' in val) tSkillType = val.type;
            if ('target' in val) tSkillTarget = val.target;
            if ('name' in val) tSkill[key].name = val.name;
            if (tSkillType == "buff") {
                if (tSkillTarget == "ally") {
                    updateForSkillCalculateBattle(tSkill, ally, skillEffect.time.val, "buff");
                } else if (tSkillTarget == "self") {
                    updateForSkillCalculateBattle(tSkill, [charObj], skillEffect.time.val, "buff");
                } else if (tSkillTarget == "self_aura_grid") {
                    var targetGrid = getAuraTargetGrid(charObj);
                    var grepList = $.grep(ally, function(e) {return targetGrid.indexOf(e.c.selfGrid) >= 0;});
                    updateForSkillCalculateBattle(tSkill, grepList, skillEffect.time.val, "buff");
                } else if (TYPES.indexOf(tSkillTarget) >= 0) {
                    var grepList = $.grep(ally, function(e) {return e.type == tSkillTarget;});
                    updateForSkillCalculateBattle(tSkill, grepList, skillEffect.time.val, "buff");
                }
            } else if (tSkillType == "debuff") {
                updateForSkillCalculateBattle(tSkill, [enemy], skillEffect.time.val, "debuff");
            } else if (tSkillType == "attack") {
                if (key == "attack") {
                    //charObj.c.skillAttack = tSkill.attack.val;
                }
            }
        });
    }
}

function isBuffAttrPercent(key) {
    return SKILL_TYPE_IS_PERCENT.indexOf(key) >= 0;
}

function updateForSkillCalculateBattle(skillEffect, targetObjs, time, effectType) {
    $.each(skillEffect, function(key, val) {
        if (key != "time") {
            for (var i in targetObjs) {
                var t = targetObjs[i];
                var row = {};
                row[key] = {};

                if (isBuffAttrPercent(key)) {
                    if (effectType == "buff") {
                        row[key]["val"] = 1 + 0.01 * val.val;
                    } else {
                        row[key]["val"] = 1 - 0.01 * val.val;
                    }
                } else {
                    row[key]["val"] = val.val * 1.0;
                }

                row[key]["time"] = time * FRAME_PER_SECOND;
                row[key]["infinitetime"] = time == 0;
                row[key]["existDuration"] = 0;
                row[key]["skillName"] = val.name;
                row[key]["stack"] = val.stack;
                if ('stackMax' in val && mIsDetailCalculate) {
                    row[key]["stackMax"] = val.stackMax;
                    row[key]["stackUpWhenEveryTime"] = val.stackUpWhenEveryTime * FRAME_PER_SECOND;
                    row[key]["stack"] = 0;
                    if ('initStack' in val) row[key]["stack"] = val.initStack;
                }

                if ('cleanBuff' in val) {
                    var clean = val.cleanBuff;
                    if (val.cleanBuff == "same") {
                        clean = val.name;
                    }

                    t.cb.buff = $.grep(t.cb.buff, function(e) {
                        for (var j in e) {
                            if (e[j]["skillName"] == clean) {
                                return false;
                            }
                            return true;
                        }
                    });
                }
                t.cb.buff.push(row);
            }
        }
    });
}

function getSkillCooldownTime(skill, skillLevel, cooldownTimeReduction) {
    var cooldownTime = skill.cooldownTime;
    var e = (1.0 * cooldownTime["10"] - 1.0 * cooldownTime["1"]) / 9.0 * (skillLevel - 1.0) + 1.0 * cooldownTime["1"];
    e = e * (1 - cooldownTimeReduction * 0.01);
    e = e.toFixed(1) * 1
    return e;
}

function updateAttrBeforAction(charObj) {
    if (!('cb' in charObj)) return;
    var battleisNight = $('.battle_control .battleisNight').is(":checked");
    charObj.cb.attr = copyObject(charObj.c);
    $.each(charObj.cb.buff, function(key, e) {
        for (var j in e) {
            if ('stackUpWhenEveryTime' in e[j]) {
                if (e[j]["existDuration"] > 0 && e[j]["existDuration"] % e[j]["stackUpWhenEveryTime"] == 0) {
                    e[j]["stack"]++;
                    if (e[j]["stack"] > e[j]["stackMax"]) e[j]["stack"] = e[j]["stackMax"];
                }
            }
            e[j]["existDuration"]++;
        }
    });

    charObj.cb.buff = $.grep(charObj.cb.buff, function(e) {
        for (var j in e) {
            if (e[j]["infinitetime"]) {
                return true;
            } else {
                return e[j]["time"]-- > 0;
            }
        }
    });

    $.each(charObj.cb.buff, function(key, val) {
        var row = {};
        for (var j in val) {
            row = val[j];
            if (j == "attackTimes" || j == "criAttack") {
                charObj.cb.attr[j] = row.val;
            } else if (j == "belt" || j == "shield") {
                charObj.cb[j] += row.val;
                row.time = -1;
                row.infinitetime = false;
            } else {
                var stack = row.stack;
                for (var i = 0; i < stack; i++) {
                    charObj.cb.attr[j] = charObj.cb.attr[j] * row.val;
                }
            }
        }
    });

    charObj.cb.attr.dmg = Math.floor(charObj.cb.attr.dmg);
    charObj.cb.attr.dmg_o = charObj.cb.attr.dmg;
    charObj.cb.attr.hit = Math.floor(charObj.cb.attr.hit);
    charObj.cb.attr.dodge = Math.floor(charObj.cb.attr.dodge);
    charObj.cb.attr.fireOfRate = Math.floor(charObj.cb.attr.fireOfRate);
    charObj.cb.attr.criRate = Math.floor(charObj.cb.attr.criRate);
    charObj.cb.attr.armor = Math.floor(charObj.cb.attr.armor);

    if (charObj.type != "mg") charObj.cb.attr.fireOfRate = Math.min(charObj.cb.attr.fireOfRate, 120);
    if (charObj.type == "rf") charObj.cb.attr.fireOfRate = Math.min(charObj.cb.attr.fireOfRate, 110);
    if (charObj.type == "sg") charObj.cb.attr.fireOfRate = Math.min(charObj.cb.attr.fireOfRate, 60);
    charObj.cb.attr.criRate = Math.min(charObj.cb.attr.criRate, 100);

    if (battleisNight) {
        charObj.cb.attr.hit *= 1.0 - (0.9 * 0.01 * Math.max(100 - charObj.c.nightSight * 1, 0));
        charObj.cb.attr.hit = Math.floor(charObj.cb.attr.hit);
    }
}

function calculateArmorPiercing(charObj, enemy) {
    if (charObj.c.armorPiercing - enemy.cb.attr.armor >= 2) {
        charObj.cb.attr.dmg += 2;
    } else if (enemy.cb.attr.armor > charObj.c.armorPiercing) {
        charObj.cb.attr.dmg -= enemy.cb.attr.armor - charObj.c.armorPiercing;
    }

    charObj.cb.attr.dmg = Math.max(charObj.cb.attr.dmg, 1);
}

function calculateHitRate(charObj, enemy) {
    charObj.cb.attr.hitRate = charObj.cb.attr.hit / (charObj.cb.attr.hit + enemy.cb.attr.dodge);
}

function getCriAttackExpectedValue(criRate, criDmg) {
    criRate = Math.min(criRate, 100);
    criRate = Math.max(criRate, 0);
    return 1 - criRate * 0.01 + (1 + criDmg / 100.0) * criRate * 0.01;
}

function calculateActionDmg(charObj, enemy, mode) {
    var isCanCri = true;
    var resetAttackedTimes = false;
    var attackMultiply = 1.0;
    var extraAttack = 0.0;
    var criAttackE = 1.0;
    var link = 1;

    charObj.cb.attr.dmg_single = charObj.cb.attr.dmg * charObj.cb.attr.hitRate;
    if ('attackTimes' in charObj.cb.attr) {
        charObj.cb.attr.dmg_single *= charObj.cb.attr.attackTimes;
    }

    if ('criAttack' in charObj.cb.attr) {
        charObj.cb.attr.criRate = Math.max(charObj.cb.attr.criRate, 100);
    }

    if ('everyAttackTimesOnNext' in charObj.skill && mode == ACTION) {
        var skillEveryAttackTimesOnNext = parseInt(charObj.skill.everyAttackTimesOnNext);
        if (charObj.cb.attackedTimes == skillEveryAttackTimesOnNext) {
            attackMultiply = getSkillAttrValByLevel(charObj, "attack");
            isCanCri = false;
            resetAttackedTimes = true;
        }
    }

    if ('everyAttack' in charObj.skill) {
        if ('extraAttack' in charObj.skill.effect) {
            var rate = getSkillAttrValByLevel(charObj, "extraAttack", "rate");
            extraAttack = getCriAttackExpectedValue(100, charObj.cb.attr.criDmg) * rate * 0.01;
        }
    }

    if (isCanCri) {
        criAttackE = getCriAttackExpectedValue(charObj.cb.attr.criRate, charObj.cb.attr.criDmg);
    }

    if (mDmgLinkMode == MULTI_LINK) {
        link = charObj.c.link;
    }

    if (mode == ACTION) {
        charObj.cb.attackedTimes++;
        if (resetAttackedTimes) charObj.cb.attackedTimes = 0;
        charObj.cb.attr.dmg_frame = charObj.cb.attr.dmg_single * (criAttackE + extraAttack) * attackMultiply * link * (2.0 - enemy.cb.attr.reducedDamage);
    } else if (mode == PERFORMANCE) {
        charObj.cb.attr.attackFrame = getAttackFrame(charObj);
        var attackTimesPerSecond = 30.0 / charObj.cb.attr.attackFrame;
        charObj.cb.attr.dps = charObj.cb.attr.dmg_single * (criAttackE + extraAttack) * attackMultiply * attackTimesPerSecond * link * (2.0 - enemy.cb.attr.reducedDamage);
        charObj.cb.skillAttack = charObj.cb.skillAttack * charObj.cb.attr.dmg_o * (2.0 - enemy.cb.attr.reducedDamage);
        if ('radius' in charObj.skill) {
        } else {
            charObj.cb.skillAttack *= link;
        }
    }
}

function calculateBattle() {
    var dmgTable = {};
    dmgTable.x = [];
    dmgTable.y = [];
    var ally = [];

    var enemyDodge = $('.battle_control .enemyDodge').val();
    if (enemyDodge == "") {
        enemyDodge = 0;
    }

    var enemyArmor = $('.battle_control .enemyArmor').val();
    if (enemyArmor == "") {
        enemyArmor = 0;
    }

    var battleisNight = $('.battle_control .battleisNight').is(":checked");
    var battleFortress = $('.battle_control .battleFortress').is(":checked");
    var fortressLevel = $('.battle_control .fortress_level').val();

    var endTime = $('.calculate_control .endTime').val();
    if (endTime == "") {
        endTime = 0;
    } else {
        endTime = endTime * FRAME_PER_SECOND;
    }

    var walkTime = $('.calculate_control .walkTime input').val();
    if (walkTime == "") {
        walkTime = 0;
    } else {
        walkTime = walkTime * FRAME_PER_SECOND;
    }

    updateCharObsForBase();
    updateCharObsForFairyAura();
    updateCharObsForAura();

    for (var i in GRIDS) {
        if (mGridToChar[GRIDS[i]] != "") {
            var charObj = mGridToChar[GRIDS[i]];
            charObj = copyObject(charObj);
            charObj.cb = copyObject(charObj.c);
            charObj.cb.attr = copyObject(charObj.c);
            charObj.cb.actionFrame = getAttackFrame(charObj);
            charObj.cb.actionType = "attack";
            charObj.cb.skillCD = getSkillFirstCooldownTime(charObj) * 30 - walkTime;
            charObj.cb.skillUsedTimes = 0;
            charObj.cb.attackedTimes = 0;
            charObj.cb.buff = [];

            ally.push(charObj);
        }
    }

    for (var i in ally) {
        dmgTable.y[i] = {};
        dmgTable.y[i]["name"] = ally[i].name;
        dmgTable.y[i]["data"] = [];
        dmgTable.y[i]["data"][0] = 0;

        var charObj = ally[i];
        var skillType = charObj.skill.type;
        if (skillType == "activeWithPassive") {
            usePassiveSkillForCalculateBattle(charObj);
        }
    }

    if (mFairy != null) {
        useFairyMasteryForCalculateBattle(mFairy, ally);
        if (mFairy.isUseSkill && mFairy.skill.type == BUFF) {
            useFairySkillForCalculateBattle(mFairy, ally, null);
        }
    }
    if (battleFortress) {
        useFortressForCalculateBattle(ally, fortressLevel);
    }

    var enemy = {};
    for (var i in ally) {
        enemy = copyObject(ally[i]);
        enemy.id = "enemy";
        enemy.c.dodge = enemyDodge * 1;
        enemy.c.armor = enemyArmor * 1;
        enemy.cb = copyObject(enemy.c);
        enemy.cb.buff = [];
        break;
    }

    dmgTable.x.push(0);
    for (var nowFrame = 1; nowFrame <= endTime; nowFrame++) {
        dmgTable.x.push(parseInt((nowFrame / 30.0 * 100)) / 100.0);
        for (var i in ally) {
            dmgTable.y[i]["data"][nowFrame] = dmgTable.y[i]["data"][nowFrame - 1];

            var charObj = ally[i];
            charObj.cb.skillCD--;
            if (charObj.c.isUseSkill) {
                var skillType = charObj.skill.type;
                if (charObj.cb.skillCD <= 0 && charObj.cb.actionType == "attack" && skillType != "passive") {
                    if ('prepareTime' in charObj.skill) {
                        charObj.cb.actionType = PREPARE_TO_USE_SKILL;
                        charObj.cb.actionFrame = charObj.skill.prepareTime * 30;

                        if (charObj.id == "183") {
                            useSkillForCalculateBattle(charObj, ally, enemy);
                        }
                    } else if (skillType == "buff" || skillType == "debuff" || skillType == "activeWithPassive") {
                        useSkillForCalculateBattle(charObj, ally, enemy);
                    } else if (skillType == "attack") {
                        charObj.cb.actionType = USE_ATTACK_SKILL;
                        charObj.cb.actionFrame = 0;
                    }
                    charObj.cb.skillCD = getSkillCooldownTime(charObj.skill, charObj.c.skillLevel, charObj.c.cooldownTimeReduction) * 30;
                    charObj.cb.skillUsedTimes = 0;
                }
            }
        }

        updateAttrBeforAction(enemy);
        for (var i in ally) {
            var charObj = ally[i];
            updateAttrBeforAction(charObj);
            charObj.cb.actionFrame--;
            if (charObj.cb.actionFrame <= 0) {
                if (charObj.cb.actionType == "attack") {
                    calculateArmorPiercing(charObj, enemy);
                    calculateHitRate(charObj, enemy);
                    calculateActionDmg(charObj, enemy, ACTION);
                    dmgTable.y[i]["data"][nowFrame] += parseInt(charObj.cb.attr.dmg_frame);
                    charObj.cb.actionFrame = getAttackFrame(charObj);
                    if (charObj.type == "mg") {
                        charObj.cb.belt--;
                        if (charObj.cb.belt <= 0) {
                            charObj.cb.actionFrame = getMgChangeBeltFrame(charObj.cb.attr.fireOfRate);
                            charObj.cb.actionType = "changeBelt";

                            if ('everyChangeBelt' in charObj.skill) {
                                useSkillForCalculateBattle(charObj, ally, null);
                            }
                        }
                    }
                } else if (charObj.cb.actionType == "changeBelt") {
                    charObj.cb.belt = charObj.c.belt;
                    charObj.cb.actionFrame = getAttackFrame(charObj);
                    charObj.cb.actionType = "attack";
                    charObj.cb.attackedTimes = 0;
                } else if (charObj.cb.actionType == PREPARE_TO_USE_SKILL || charObj.cb.actionType == USE_ATTACK_SKILL) {
                    charObj.cb.skillUsedTimes++;
                    var attackMultiply = getSkillAttrValByLevel(charObj, "attack");
                    var attackMultiplyExtra = getSkillAttrValByLevel(charObj, "attack", "extraToTarget");
                    var link = 1;

                    if (isArmorUnit(enemy)) {
                        var attackToArmor = getSkillAttrValByLevel(charObj, "attack", "attackToArmor");
                        if (attackToArmor != null) attackMultiply = attackToArmor;
                    }

                    if (attackMultiplyExtra != null) {
                        attackMultiply += attackMultiplyExtra;
                    }

                    if (mDmgLinkMode == MULTI_LINK) {
                        link = charObj.c.link;
                    }
                    if ('radius' in charObj.skill) {
                        link = 1;
                    }

                    dmgTable.y[i]["data"][nowFrame] += parseInt(charObj.cb.attr.dmg_o * attackMultiply * link * (2.0 - enemy.cb.attr.reducedDamage));

                    if ('skillTimes' in charObj.skill && charObj.cb.skillUsedTimes < charObj.skill.skillTimes) {
                        charObj.cb.actionType = PREPARE_TO_USE_SKILL;
                        if ('prepareTime' in charObj.skill) {
                            charObj.cb.actionFrame = charObj.skill.prepareTime * 30;
                        } else {
                            charObj.cb.actionFrame = 1 * 30;
                        }
                    } else {
                        charObj.cb.actionFrame = 12;
                        charObj.cb.actionType = "attack";
                    }
                }
            }
        }
    }
    return dmgTable;
}

function isArmorUnit(obj) {
    if ('attr' in obj.cb && obj.cb.attr.armor > 0) return true;
    if (obj.cb.armor > 0) return true;
    return false
}

function updateCharObs() {
    var enemyDodge = $('.battle_control .enemyDodge').val();
    if (enemyDodge == "") {
        enemyDodge = 0;
    }

    var enemyArmor = $('.battle_control .enemyArmor').val();
    if (enemyArmor == "") {
        enemyArmor = 0;
    }

    var battleFortress = $('.battle_control .battleFortress').is(":checked");
    var fortressLevel = $('.battle_control .fortress_level').val();

    updateCharObsForBase();
    updateCharObsForFairyAura();
    updateCharObsForAura();

    var ally = [];
    for (var i in GRIDS) {
        if (mGridToChar[GRIDS[i]] != "") {
            var charObj = mGridToChar[GRIDS[i]];
            charObj.cb = copyObject(charObj.c);
            charObj.cb.attr = copyObject(charObj.c);
            charObj.cb.buff = [];

            ally.push(charObj);
        }
    }

    var enemy = {};
    for (var i in ally) {
        enemy = copyObject(ally[i]);
        enemy.id = "enemy";
        enemy.c.dodge = enemyDodge * 1;
        enemy.c.armor = enemyArmor * 1;
        enemy.cb = copyObject(enemy.c);
        enemy.cb.buff = [];
        break;
    }
    mEnemy = enemy;

    updateCharObsForUseSkill();
    if (mFairy != null) {
        useFairyMasteryForCalculateBattle(mFairy, ally);
        if (mFairy.isUseSkill && mFairy.skill.type == BUFF) {
            useFairySkillForCalculateBattle(mFairy, ally, null);
        }
    }
    if (battleFortress) {
        useFortressForCalculateBattle(ally, fortressLevel);
    }
    updateCharObsForBattle();
}

function getAuraEffectByLink(auraEffect, link) {
    var l = {};
    $.each(auraEffect, function(key, val) {
        var e = Math.floor((1 * val["5"] - 1 * val["1"]) / 4 * (link - 1) + 1 * val["1"]);
        l[key] = e;
    });

    return l;
}

function getSkillByLevel(skillEffect, skillLevel) {
    var l = {};
    $.each(skillEffect, function(key, val) {
        if (skillLevel == null) {
            if ('val' in val) {
                l[key] = {};
                l[key]["val"] = val.val;
            }
        } else if (skillLevel in val) {
            if (val[skillLevel] == "") {

            } else {
                l[key] = {};
                l[key]["val"] = val[skillLevel] * 1.0;
            }
        } else {
            if (val["10"] == "" || val["1"] == "") {

            } else {
                var e = (1.0 * val["10"] - 1.0 * val["1"]) / 9.0 * (skillLevel - 1.0) + 1.0 * val["1"];
                if (key == "time" || key == "attack" || key == "attackDot" || key == "extraToTarget") {
                    e = e.toFixed(1) * 1;
                } else {
                    e = e.toFixed(0) * 1;
                }
                l[key] = {};
                l[key]["val"] = e;
            }
        }

        for (var i in SKILL_EFFECT_KEY_COPY) {
            var effectKey = SKILL_EFFECT_KEY_COPY[i];
            if (effectKey in val) {
                l[key][effectKey] = val[effectKey];
            }
        }

        for (var i in SKILL_EFFECT_KEY_NESTED) {
            var effectKey = SKILL_EFFECT_KEY_NESTED[i];
            if (effectKey in val) {
                var nested = {};
                nested[effectKey] = val[effectKey];
                nested = getSkillByLevel(nested, skillLevel);
                l[key][effectKey] = nested[effectKey]["val"];
            }
        }
    });

    if (!('time' in l)) {
        l.time = {};
        l.time.val = 0;
    }
    return l;
}

function updateForSkill(skillEffect, targetObjs) {
    $.each(skillEffect, function(key, val) {
        if (key != "time") {
            for (var i in targetObjs) {
                var t = targetObjs[i];
                if (isBuffAttrPercent(key)) {
                    t.c[key] = t.c[key] * (1 + 0.01 * val.val);
                } else if (key == "attackTimes") {
                    t.c[key] = val.val * 1.0;
                } else {
                    t.c[key] += val.val * 1.0;
                }
            }
        }
    });
}

function getLink(level) {
    if (level >= 90) return 5;
    if (level >= 70) return 4;
    if (level >= 30) return 3;
    if (level >= 10) return 2;
    return 1;
}

function gridToXY(grid) {
    var pos = {};
    if (grid == "7") {
        pos.x = -1;
        pos.y = -1;
    }
    if (grid == "8") {
        pos.x = 0;
        pos.y = -1;
    }
    if (grid == "9") {
        pos.x = 1;
        pos.y = -1;
    }
    if (grid == "4") {
        pos.x = -1;
        pos.y = 0;
    }
    if (grid == "5") {
        pos.x = 0;
        pos.y = 0;
    }
    if (grid == "6") {
        pos.x = 1;
        pos.y = 0;
    }
    if (grid == "1") {
        pos.x = -1;
        pos.y = 1;
    }
    if (grid == "2") {
        pos.x = 0;
        pos.y = 1;
    }
    if (grid == "3") {
        pos.x = 1;
        pos.y = 1;
    }

    return pos;
}

function debugChar() {
    var l = [];
    for (var i in mCharData) {
        var charObj = mCharData[i];

        if (false) {
            var skill = charObj.skill;
            var skillType = skill.type;
            var skillEffect = [];
            if (false && 'effectNight' in skill) {
                skillEffect = getSkillByLevel(skill.effectNight, 10);
            }
            if (true && 'effect' in skill) {
                skillEffect = getSkillByLevel(skill.effect, 10);
                if (skill.effect.time["1"] == 5 && skill.effect.time["10"] == 8) {
                    l.push(charObj.name);
                }
            }

            $.each(skillEffect, function(key, val) {
                var tSkillType = skillType;
                if ('type' in val) tSkillType = val.type;
                if (tSkillType == "buff" || tSkillType == "debuff") {
                    if (!('time' in skillEffect)) {
                        alert("id: " + charObj.id + " skill no time val");
                    }
                } else if (tSkillType == "attack") {
                }
            });
        }

        if (true) {
            $.each(charObj.aura.effect, function(key, val) {
                if (val["1"] == "") {
                    l.push(charObj.name);
                }
            });
        }
    }
    alert(l);
}

function debugString(str) {
    $('.debug').html(str);
    $('.debug').show();
}

jQuery.fn.swap = function(b){
    // method from: http://blog.pengoworks.com/index.cfm/2008/9/24/A-quick-and-dirty-swap-method-for-jQuery
    b = jQuery(b)[0];
    var a = this[0];
    var t = a.parentNode.insertBefore(document.createTextNode(''), a);
    b.parentNode.insertBefore(a, b);
    t.parentNode.insertBefore(b, t);
    t.parentNode.removeChild(t);
    return this;
};

;!(function ($) {
    $.fn.classes = function (callback) {
        var classes = [];
        $.each(this, function (i, v) {
            var splitClassName = v.className.split(/\s+/);
            for (var j = 0; j < splitClassName.length; j++) {
                var className = splitClassName[j];
                if (-1 === classes.indexOf(className)) {
                    classes.push(className);
                }
            }
        });
        if ('function' === typeof callback) {
            for (var i in classes) {
                callback(classes[i]);
            }
        }
        return classes;
    };
})(jQuery);

var swapArrayElements = function(arr, indexA, indexB) {
      var temp = arr[indexA];
        arr[indexA] = arr[indexB];
          arr[indexB] = temp;
};

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm > 9 ? '' : '0') + mm,
          (dd > 9 ? '' : '0') + dd
         ].join('/');
};
//alert(JSON.stringify(charObj));
