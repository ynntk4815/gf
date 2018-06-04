
const TYPES = ["hg", "smg", "ar", "rf", "mg", "sg"];
const GRIDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SKILL_TYPE_IS_PERCENT = ["hit", "dodge", "armor", "fireOfRate", "dmg", "criRate", "cooldownTime", "criDmg", "movementSpeed", "rate", "reducedDamage"];
const SKILL_EFFECT_KEY_COPY = ["target", "type", "everyTime", "stackMax", "stackUpWhenEveryTime", "cleanBuff", "name", "initStack", "prepareTime", "attackSkillTimes", "radius", "multiplyByTypeCount", "howOccur"];
const SKILL_EFFECT_KEY_NESTED = ["rate", "attackToArmor", "extraToTarget"];
const CHAR_LEVEL_EQUIPMENT = [20, 50, 80];
const FRAME_PER_SECOND = 30;
const PREPARE_TO_USE_SKILL = "prepareToUseSkill";
const PREPARE_TO_ATTACK = "prepareToAttack";
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
const CHAR_SKILL_PASSIVE = "char_skill_passive";
const BUFF = "buff";
const FORTRESS = "fortress";
const ALLY = "ally";
const EXTRA = "extra";
const CHAR_RARITY_LISTS = ["2", "3", "4", "5", "extra"];
const CRI_RATE = "criRate";
const VERSION = "version";
const EVERY_ATTACK_CHANCE = "everyAttackChance";
const DAY = "day";
const NIGHT = "night";
const COUNT = "count";
const MOD = "mod";

var mPickerType = "";
var mPickerEquipmentIndex = "";
var mEquipmentData = "";
var mFairyData = "";
var mStringData = "";
var mUpdate = [];
var mCharData = [];
var mAttackFrameData = [];
var mGridOrder = [];
var mFormation = [];
var mGridToUI = [];
var mGridToChar = [];
var mGridHasChar = [];
var mDmgLinkMode = SINGLE_LINK;
var mIsDetailCalculate = false;
var mFairy = null;
var mVersion = "tw";
var mRandom = new Random();
var mData;
var mIsCancel = true;
var mColors = ['#058DC7', '#50B432', '#ED561B', '#ffa500', '#A252F8', '#24CBE5', '#FF9655', '#FFF263', '#6AF9C4'];
var environmentFilter = (v => {
    var battleisNight = $('.battle_control .battleisNight').is(":checked");
    if ('environment' in v) {
        if (battleisNight) {
            return v.environment == NIGHT;
        } else {
            return v.environment == DAY;
        }
    }
    return true;
});
var targetFilter = (v => {
    if ('eliteTarget' in v) {
        var eliteTarget = $('.battle_control .enemyEliteTarget').is(":checked");
        return eliteTarget == v.eliteTarget;
    }
    return true;
});

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

    $('.char .modLevel').change(function() {
        updateCharObs();
        updateModControlUIByGrid($(this).attr("grid_value"));
        updateSkillControlUIByGrid($(this).attr("grid_value"));
        updatePerformance();
    });

    $('.equipment_container select').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.char .skill_level, .char .mod_skill_level').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.char .skill_stack, .char .skill_effect').change(function() {
        updateCharObs();
        updatePerformance();
    });

    $('.char .skill_control').change(function() {
        updateCharObs();
        updatePerformance();
        updateSkillControlUIByGrid($(this).attr("grid_value"));

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
                if ('lv' in val) controlUI.find(".level").val(val.lv);
                if ('modlv' in val) controlUI.find(".modLevel").val(val.modlv);
                if ('mod2slv' in val) controlUI.find(".mod_skill_level").val(val.mod2slv);
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
        $('#detailCalculate .control_input').hide();
        $('#detailCalculate .startSimulation').hide();
        $('#detailCalculate #text').hide();
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

        var ally = copyList(getAlly());
        allyInit(ally);
        var enemy = copyObject(ally[0]);
        enemyInit(enemy);

        updateCalculateChart(battleSimulation(endTime, walkTime, copyList(ally), copyObject(enemy), false));
    });

    $('.simulation').click(function() {
        $('#detailCalculate').dialog("open");
        $('#detailCalculate .control_input').show();
        $('#detailCalculate .startSimulation').show();
        $('#detailCalculate #text').show();
        updateCalculateChart([]);
    });

    $('.startSimulation').click(function() {
        if (mIsCancel) {
            startBattleSimulation();
        }
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
        }).filter(function(i, x) {
            return mGridHasChar.indexOf($(x).attr("grid_value")) >= 0;
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

    $('.update_log').html(mStringData["contact"] + " & " + mStringData["updateLog"]);
    $('.last_update_time').html(mStringData["last_update"] + " " + mUpdate[0].date.yyyymmdd());
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

function startBattleSimulation() {
    var n = parseInt($('#detailCalculate #times').val());
    mData = [];
    mIsCancel = false;
    var progress = $('#detailCalculate #text');

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

    var ally = copyList(getAlly());
    allyInit(ally);
    var enemy = copyObject(ally[0]);
    enemyInit(enemy);

    var f = function() {
        if (mIsCancel) return;
        mData.push(battleSimulation(endTime, walkTime, copyList(ally), copyObject(enemy), true));
        progress.html(mData.length);

        if (mData.length >= n) {
            var odata = mData;
            var data = mData[0];
            for (var i = 1; i < n; i++) {
                for (var c in odata[i].y) {
                    for (var f in odata[i].y[c]["data"]) {
                        data.y[c]["data"][f] += odata[i].y[c]["data"][f];
                    }
                }
            }

            for (var c in data.y) {
                for (var f in data.y[c]["data"]) {
                    data.y[c]["data"][f] /= n;
                }
            }

            updateCalculateChart(data);
            mIsCancel = true;
        }
    }

    for (var i = 0; i < n; i++) {
        setTimeout(f, 0);
    }
}

function updateCalculateChart(data) {
    Highcharts.setOptions({
        colors: mColors
    });
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
}

function getSkillDetail(grid) {
    var charObj = mGridToChar[grid];
    var skill = charObj.skill;

    if ('detailText' in skill) {
        var text = [];
        text.push(mStringData.firstCooldownTime.format(getSkillFirstCooldownTime(charObj)));
        text.push(mStringData.cooldownTime.format(getSkillCooldownTime(charObj.skill, charObj.c.skillLevel, charObj.c.cooldownTimeReduction)));
        if (charObj.id != "102") {
            text = text.concat(getCharSkillDetail(charObj));
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
                if ('everyChangeAmmoCount' in charObj.skill) {
                    s += mStringData.everyChangeAmmoCount;
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
                } else if (key == "ammoCount") {
                    s += mStringData.addAmmoCount.format(val.val);
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
        mIsCancel = true;
    });
    $('#detailCalculate').on('dialogopen', function(event) {
        mIsDetailCalculate = true;
    });
    $('#updateDialog').dialog({autoOpen: false, width: 'auto', modal : true});
    $('#updateDialog').dialog({position: {my: "left bottom", at: "left top", of: ".update_log"}});

    var row = $('<tr></tr>');
    var typeList = copyObject(TYPES);
    typeList.push(MOD);
    typeList.forEach(v => {
        var item = $('<div></div>').addClass("pick_button hover").html(v).attr("value", v).click(function() {
            openDialogPickerByType($(this).attr("value"));
        });
        $('<td></td>').append(item).appendTo(row);
    });

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
    var removedColor = mColors.splice(mGridHasChar.indexOf(g), 1);
    mGridHasChar = $.grep(mGridHasChar, function(e) {return e != g;});
    removedColor.forEach(v => mColors.splice(mGridHasChar.length, 0, v));
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
                    .find(".modLevel").attr("grid_value", order).end()
                    .find(".skill_level").attr("grid_value", order).end()
                    .find(".mod_skill_level").attr("grid_value", order).end()
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
            var result = e.rarity == nowVal;
            if (type == MOD) {
                result &= e.mod;
            } else {
                result &= e.type == type;
            }
            if (auraAttr != null) {
                result &= auraAttr in e.aura.effect;
            }
            if (VERSION in e) {
                result &= e[VERSION] == mVersion;
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
            var result = e.type == FAIRY_TYPE[i];
            if (VERSION in e) {
                result &= e[VERSION] == mVersion;
            }
            return result;
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
            (Math.ceil(mFairyData.initRatio.dmg * mFairy.partyAura.dmg / 100) + Math.ceil(mFairyData.growRatio.dmg * mFairy.partyAura.dmg * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.hit =
            (Math.ceil(mFairyData.initRatio.hit * mFairy.partyAura.hit / 100) + Math.ceil(mFairyData.growRatio.hit * mFairy.partyAura.hit * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.dodge =
            (Math.ceil(mFairyData.initRatio.dodge * mFairy.partyAura.dodge / 100) + Math.ceil(mFairyData.growRatio.dodge * mFairy.partyAura.dodge * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.armor =
            (Math.ceil(mFairyData.initRatio.armor * mFairy.partyAura.armor / 100) + Math.ceil(mFairyData.growRatio.armor * mFairy.partyAura.armor * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];
    mFairy.aura.criDmg =
            (Math.ceil(mFairyData.initRatio.criDmg * mFairy.partyAura.criDmg / 100) + Math.ceil(mFairyData.growRatio.criDmg * mFairy.partyAura.criDmg * mFairy.partyAura.grow * (mFairy.level - 1) / 10000)) *
            mFairyData.rarityRatio[mFairy.rarity];

    mFairy.skills = [];
    if ("effects" in mFairy.skill) {
        var skill = {};
        skill.name = mFairy.skill.name;
        skill.firstCooldownTime = mFairy.skill.firstCooldownTime;
        skill.effects = copyList(mFairy.skill.effects);
        skill.effects.forEach(convertSkillEffects(mFairy.skillLevel, skill.name));
        mFairy.skills.push(skill);
    }
}

function convertSkillEffects(skillLevel, skillName) {
    return v => {
        if (!("name" in v)) v.name = skillName;
        var toFixedCount = 0;
        if (v.type == "attack") toFixedCount = 1;
        if ("toFixedCount" in v) toFixedCount = v.toFixedCount;
        v.value = calculateValue(v.value, skillLevel, toFixedCount);
        if ("time" in v) v.time = calculateValue(v.time, skillLevel, 1);
        if ("whenEveryXSeconds" in v) v.whenEveryXSeconds = calculateValue(v.whenEveryXSeconds, skillLevel, 1);
        if ("rate" in v) v.rate = calculateValue(v.rate, skillLevel, 1);
        if ("stackDownWhenEveryTime" in v) v.stackDownWhenEveryTime = calculateValue(v.stackDownWhenEveryTime, skillLevel, 1);
        if ("knockingBack" in v) v.knockingBack = calculateValue(v.knockingBack, skillLevel, 1);
    };
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
        mAttackFrameData = data.attackFrame;
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
            val.date = new Date(val.date);
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

function getSkillType(charObj) {
    return charObj.skill.effects.reduce((r, v) => {
        if (r == "active" || v.filter == "active") return "active";
        if (r == "passive" || v.filter == "passive") return "passive";
        if (r == "battleStart" || v.filter == "battleStart") return "battleStart";
        return r;
    });
}

function addChar(grid, id) {
    $('#picker_by_type').dialog("close");
    $('#picker').dialog("close");

    var t = getChar(id);
    var ui = $("." + mGridToUI[grid]);
    mGridToChar[grid] = t;

    $("." + mGridToUI[grid] + " .add_button").hide();
    $("." + mGridToUI[grid] + " .char .img").html(getCharImgUIObj(id));
    var skillType = null;
    if ("type" in mGridToChar[grid].skill) skillType = mGridToChar[grid].skill;
    if ("effects" in mGridToChar[grid].skill) {
        skillType = getSkillType(mGridToChar[grid]);
    } else {
        $("." + mGridToUI[grid] + " .char .skill_effect").hide();
    }
    if (skillType == "passive" || skillType == "battleStart") {
        $("." + mGridToUI[grid] + " .char .skill_control").prop("disabled", true);
        $("." + mGridToUI[grid] + " .char .skill_control").prop("checked", true);
    } else {
        $("." + mGridToUI[grid] + " .char .skill_control").prop("disabled", false);
        $("." + mGridToUI[grid] + " .char .skill_control").prop("checked", false);
        $(".skill_all").prop("checked", false);

        if ('stack' in mGridToChar[grid].skill && mGridToChar[grid].skill.stack > 0) {
            $("." + mGridToUI[grid] + " .char .skill_stack").show();
            $("." + mGridToUI[grid] + " .char .skill_stack").empty();
            for (var i = mGridToChar[grid].skill.stack; i >= 0; i--) {
                $("." + mGridToUI[grid] + " .char .skill_stack").append(
                        $("<option></option>").attr("value", i).text(i + mStringData.stack));
            }
        } else {
            $("." + mGridToUI[grid] + " .char .skill_stack").hide();
        }
    }
    if ('mod' in t && t.mod) {
        ui.find(".level").hide();
        ui.find(".modLevel").show();
        var modLv = parseInt(ui.find(".modLevel").val());
        if (modLv >= 2) {
            ui.find(".mod_skill_level").show();
        } else {
            ui.find(".mod_skill_level").hide();
        }
    } else {
        ui.find(".level").show();
        ui.find(".modLevel").hide();
        ui.find(".mod_skill_level").hide();
    }
    if ($('.view_equipment').is(":checked")) {
        $("." + mGridToUI[grid] + " .char").hide();
        $("." + mGridToUI[grid] + " .equipment_container").show();
    } else {
        $("." + mGridToUI[grid] + " .char").show();
        $("." + mGridToUI[grid] + " .equipment_container").hide();
    }

    var auraUI = $("." + mGridToUI[grid] + " .aura_container");
    var g = getGridUiObj(grid).attr("grid_value");
    if (mGridHasChar.indexOf(g) >= 0) {

    } else {
        mGridHasChar.push(g);
    }
    updateCharObs();
    updateAuraUI(auraUI, mGridToChar[grid]);
    updateEquipmentUI(mGridToChar[grid]);
    updatePerformance();
    updateSkillControlUI(t);
}

function updateSkillControlUIByGrid(grid) {
    var g = getGridByUIValue(grid);
    updateSkillControlUI(getCharObjByGrid(g));
}

function workWhenHaveBuffFilter(charObj) {
    return (v => {
        if ("workWhenHaveBuff" in v) {
            return isHaveBuff(charObj, v.workWhenHaveBuff);
        }
        return true;
    });
}

function updateSkillControlUI(charObj) {
    if (!("effects" in charObj.skill)) return;
    var haveStack = getFilterEffects(charObj).filter(workWhenHaveBuffFilter(charObj)).filter(v => v.type == "buff" || v.type == "debuff").filter(v => {
        return "stackMax" in v;
    });
    if (haveStack.length > 0) {
        var count = haveStack[0].stackMax
        charObj.ui.controlUI.find(".skill_stack").show();
        charObj.ui.controlUI.find(".skill_stack").empty();
        for (var i = 0; i <= count; i++) {
            charObj.ui.controlUI.find(".skill_stack").append(
                $("<option></option>").attr("value", i).text(i + mStringData.stack));
        }
        charObj.ui.controlUI.find(".skill_stack").val(0);
        charObj.ui.controlUI.find(".skill_stack").trigger("change");
    } else {
        charObj.ui.controlUI.find(".skill_stack").hide();
    }

    var effectGrouped = getFilterEffectsForUI(charObj).filter(workWhenHaveBuffFilter(charObj)).filter(v => v.type == "buff" || v.type == "debuff").filter(v => {
        return v.grouped;
    });
    var effectItem = charObj.ui.controlUI.find(".skill_effect");
    if (effectGrouped.length > 0) {
        effectItem.show();
        effectItem.empty();
        effectGrouped.forEach(v => {
            effectItem.append(
                $("<option></option>").attr("value", v.indexGrouped).text(v.name));
        });
        effectItem.val(1);
        effectItem.trigger("change");
    } else {
        effectItem.hide();
    }
}

function updateEquipmentUIByGrid(grid) {
    var g = getGridByUIValue(grid);
    updateEquipmentUI(getCharObjByGrid(g));
}

function getEquipmentById(id) {
    var grepList = $.grep(mEquipmentData.equipment, function(e){return e.id == id;});
    return grepList[0];
}

function updateModControlUIByGrid(grid) {
    var g = getGridByUIValue(grid);
    updateModControlUI(getCharObjByGrid(g));
}

function updateModControlUI(charObj) {
    if (charObj.c.modLevel >= 2) {
        charObj.ui.controlUI.find(".mod_skill_level").show();
    } else {
        charObj.ui.controlUI.find(".mod_skill_level").hide();
    }
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
            item.hover(() => {
                var texts = [];
                var eObj = getEquipmentById(v.id);
                $.each(eObj.effect, (key, val) => {
                    var strengthenCoefficient = eObj.strengthenCoefficient;
                    if ('strengthenCoefficient' in val) {
                        strengthenCoefficient = val.strengthenCoefficient;
                    }
                    var str = mStringData[key];
                    str += " " + val.max * 1;
                    if (val.max > 0) {
                        str += " ~ " + Math.floor(val.max * 1 * (1 + 10 * strengthenCoefficient));
                    }
                    texts.push(str);
                });
                $('#detail').dialog({position: {my: "left top", at: "right top", of: item}});
                $("#detail .detail_container").html(texts.join("<br>"));
                $('#detail').dialog("open");
            }, () => {
                $('#detail').dialog("close");
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
    $(".grid_container").css('border-top-color', "white");
    for (var i in mGridHasChar) {
        var grid = getGridByUIValue(mGridHasChar[i]);
        if (mGridToChar[grid] != "") {
            var charObj = mGridToChar[grid];

            var skillAttack = "-";
            if (charObj.cb.skillAttack != 0) {
                skillAttack = charObj.cb.skillAttack.toFixed(2);
            }

            $(".grid_container_" + mGridHasChar[i]).css('border-top-color', mColors[index - 1]);
            var cp = $(".char_performance_" + index);
            cp.find(".value").html("-").end()
            .find(".value.name").html(charObj.name).css('color', mColors[index - 1]).end()
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
            .find(".value.ammoCount").html(charObj.cb.ammoCount).end()
            .find(".value.dps").html(charObj.cb.attr.dps.toFixed(2)).end()
            .find(".value.perDmg").html(charObj.cb.attr.dmg_single.toFixed(2)).end()
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
            if (charObj.c.modLevel > 0) {
                charRow.modlv = charObj.c.modLevel;
            } else {
                charRow.lv = charObj.c.level;
            }
            if (charObj.c.modLevel >= 2) {
                charRow.mod2slv = charObj.c.mod2SkillLevel;
            }
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

function charGetAttrByModLevel(attr, lv) {
    return attr[lv];
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

function copyList(s) {
    var d = [];
    for (var i in s) {
        var o = s[i];
        d.push(copyObject(o));
    }
    return d;
}

function findById(data, id) {
    var result = data.filter(v => v.id == id);
    if (result.length > 0) return result[0];
    else return null;
}

function getChar(id){
    var grepList = $.grep(mCharData, function(e){return e.id == id;});
    var obj = JSON.parse(JSON.stringify(grepList[0]));
    obj["criDmg"] = 150;
    obj["attackFrame"] = -1;
    obj["movementSpeed"] = 150;
    obj["equipment"] = [];
    obj["equipment"][1] = "";
    obj["equipment"][2] = "";
    obj["equipment"][3] = "";
    obj.thisType = "char";
    if (CRI_RATE in obj) {
        obj[CRI_RATE] = obj[CRI_RATE] * 1;
    } else {
        obj[CRI_RATE] = 20;
        if (obj.type == "rf" || obj.type == "sg") obj[CRI_RATE] = 40;
        if (obj.type == "smg" || obj.type == "mg") obj[CRI_RATE] = 5;
    }

    var attackFrameData = findById(mAttackFrameData, id)
    if (attackFrameData) obj["attackFrame"] = attackFrameData.frame;
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
            updateCharObsForBase2(mGridToChar[GRIDS[i]], GRIDS[i]);
        }
    }
}

function updateCharObsForBase2(charObj, grid) {
    charObj.ui = {};
    charObj.ui.controlUI = gridToUi(grid, CONTROL_CONTAINER);
    charObj.ui.equipmentUI = gridToUi(grid, EQUIPMENT_CONTAINER);
    charObj.ui.friendship = gridToUi(grid, FRIENDSHIP);

    charObj.c = {};
    charObj.c.selfGrid = parseInt(grid);
    charObj.c.level = parseInt(charObj.ui.controlUI.find(".level").val());
    charObj.c.isUseSkill = charObj.ui.controlUI.find(".skill_control").is(":checked");
    charObj.c.skillStack = parseInt(charObj.ui.controlUI.find(".skill_stack").val());
    charObj.c.skillEffect = parseInt(charObj.ui.controlUI.find(".skill_effect").val());
    charObj.c.skillLevel = parseInt(charObj.ui.controlUI.find(".skill_level").val());
    charObj.c.friendship = charObj.ui.friendship.attr("value");
    charObj.c.modLevel = 0;
    charObj.c.mod2SkillLevel = 0;
    if ('mod' in charObj && charObj.mod) {
        charObj.c.modLevel = parseInt(charObj.ui.controlUI.find(".modLevel").val());
        charObj.c.mod2SkillLevel = parseInt(charObj.ui.controlUI.find(".mod_skill_level").val());
        charObj.c.level = 100;
        var modLevel = "mod" + charObj.c.modLevel;
        charObj.c.hp = charGetAttrByModLevel(charObj.hp, modLevel);
        charObj.c.dmg = charGetAttrByModLevel(charObj.dmg, modLevel);
        charObj.c.hit = charGetAttrByModLevel(charObj.hit, modLevel);
        charObj.c.dodge = charGetAttrByModLevel(charObj.dodge, modLevel);
        charObj.c.fireOfRate = charGetAttrByModLevel(charObj.fireOfRate, modLevel);
    } else {
        charObj.c.hp = charGetAttrByLevel(charObj.hp, charObj.c.level);
        charObj.c.dmg = charGetAttrByLevel(charObj.dmg, charObj.c.level);
        charObj.c.hit = charGetAttrByLevel(charObj.hit, charObj.c.level);
        charObj.c.dodge = charGetAttrByLevel(charObj.dodge, charObj.c.level);
        charObj.c.fireOfRate = charGetAttrByLevel(charObj.fireOfRate, charObj.c.level);
    }
    charObj.c.link = getLink(charObj.c.level);
    charObj.c.criRate = charObj.criRate;
    charObj.c.criDmg = charObj.criDmg;
    charObj.c.movementSpeed = charObj.movementSpeed;
    charObj.c.shield = 0;
    charObj.c.reducedDamage = 1;
    if (charObj.type == "mg" || charObj.type == "sg") {
        charObj.c.ammoCount = parseInt(charObj.ammoCount);
    }

    if (charObj.type == "sg") {
        charObj.c.armor = charGetAttrByLevel(charObj.armor, charObj.c.level);
    } else {
        charObj.c.armor = 0;
    }

    var friendshipEffect = 0;
    if (charObj.c.friendship == FRIENDLY) friendshipEffect = 0.05;
    if (charObj.c.friendship == MARRIED) friendshipEffect = charObj.c.modLevel == 3 ? 0.15 : 0.1;
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

    charObj.c.skills = [];
    if ("effects" in charObj.skill) {
        var skill = {};
        skill.name = charObj.skill.name;
        skill.firstCooldownTime = charObj.skill.firstCooldownTime;
        skill.cooldownTime = calculateValue(charObj.skill.cooldownTime, charObj.c.skillLevel, 1);
        skill.effects = copyList(charObj.skill.effects);
        skill.effects.forEach(convertSkillEffects(charObj.c.skillLevel, skill.name));
        charObj.c.skills.push(skill);
    }

    if (charObj.c.modLevel >= 2) {
        var skill = {};
        skill.name = charObj.mod2Skill.name;
        skill.effects = copyList(charObj.mod2Skill.effects);
        skill.effects.forEach(convertSkillEffects(charObj.c.mod2SkillLevel, skill.name));
        charObj.c.skills.push(skill);
    }
}

function getFairyEffects(fairy) {
    return fairy.skills.map(v => v.effects).reduce((t, v) => t.concat(v), []);
}

function getEffects(charObj) {
    return charObj.c.skills.map(v => v.effects).reduce((t, v) => t.concat(v), []);
}

function getFilterEffects(charObj) {
    return getFilterEffectsForUI(charObj).filter(v => {
        if (v.grouped) {
            return charObj.c.skillEffect == v.indexGrouped;
        } else {
            return true;
        }
    });
}

function getFilterEffectsForUI(charObj) {
    return getEffects(charObj).filter(v => {
        if ('buffFilter' in v) {
            if ("buffFilterStackGreaterOrEqual" in v) {
                return isHaveBuffStackGreaterOrEqual(charObj, v.buffFilter, v.buffFilterStackGreaterOrEqual);
            } else
                return isHaveBuff(charObj, v.buffFilter);
        } else {
            return true;
        }
    }).filter(v => {
        if ('allyCountLessOrEqualFilter' in v) {
            return getAllyCount() <= v.allyCountLessOrEqualFilter;
        } else {
            return true;
        }
    }).filter(v => {
        if ('allyInFrontOfMe' in v) {
            var targetGrid = getFrontTargetGrid(charObj);
            return getAlly().filter(v => targetGrid.indexOf(v.c.selfGrid) >= 0).length > 0 == v.allyInFrontOfMe;
        } else {
            return true;
        }
    }).filter(environmentFilter);
}

function calculateValue(value, level, toFixedCount) {
    if ($.isNumeric(value)) return value;
    if ("0" in value) return value["0"];
    var result = 0;
    if (level in value) {
        result = value[level];
    } else {
        var u = level + 1;
        while (true) {
            if (u in value) {
                break;
            } else {
                u += 1;
            }
        }

        var d = level - 1;
        while (true) {
            if (d in value) {
                break;
            } else {
                d -= 1;
            }
        }
        result = (value[u] - value[d]) / (u - d) * (level - d) + value[d];
    }

    return result.toFixed(toFixedCount) * 1;
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

function getFrontTargetGrid(charObj) {
    var selfPos = gridToXY(charObj.c.selfGrid);
    var grids = [];
    var targetX = selfPos.x + 1;
    var targetY = selfPos.y;
    var targetGrid = xyToGrid(targetX, targetY);
    if (targetGrid != -1) {
        grids.push(targetGrid);
    }

    return grids;
}

function getColumnTargetGrid(charObj) {
    var selfPos = gridToXY(charObj.c.selfGrid);

    var grids = [];
    $.each(GRIDS, function(key, val) {
        var targetPos = gridToXY(val);
        var targetGrid = xyToGrid(targetPos.x, targetPos.y);
        if (selfPos.x == targetPos.x) {
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

                charObj.c.dmg = Math.ceil(charObj.c.dmg * (1 + 0.01 * mFairy.aura.dmg));
                charObj.c.hit = Math.ceil(charObj.c.hit * (1 + 0.01 * mFairy.aura.hit));
                charObj.c.dodge = Math.ceil(charObj.c.dodge * (1 + 0.01 * mFairy.aura.dodge));
                charObj.c.armor = Math.ceil(charObj.c.armor * (1 + 0.01 * mFairy.aura.armor));
                charObj.c.criDmg = Math.ceil(charObj.c.criDmg * (1 + 0.01 * mFairy.aura.criDmg));
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
        var skillType = null;
        if ("type" in charObj.skill) skillType = charObj.skill.type;
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

        if ('passive' in charObj.skill) {
            var skillEffect = getSkillByLevel(charObj.skill.passive.effect, charObj.c.skillLevel);
            useSkillForCalculateBattle2(charObj, ally, enemy, skillEffect, CHAR_SKILL_PASSIVE);
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
        calculateHitRate(charObj, enemy);
        calculateActionDmg(charObj, enemy, PERFORMANCE);
    }
}

function getAttackFrame(charObj) {
    if (charObj.attackFrame > 0) return charObj.attackFrame;
    if (charObj.type == "mg") return 10;
    if ('cb' in charObj) {
        return Math.ceil(50.0 * 30.0 / charObj.cb.attr.fireOfRate) - 1;
    } else {
        return Math.ceil(50.0 * 30.0 / charObj.c.fireOfRate) - 1;
    }
}

function getMgChangeAmmoCountFrame(fireOfRate) {
    return Math.ceil((4 + (200 / fireOfRate)) * 30);
}

function getSgChangeAmmoCountFrame(ammoCount) {
    return Math.ceil((1.4 + ammoCount * 0.5) * FRAME_PER_SECOND);
}

function getSkillFirstCooldownTime(charObj) {
    return charObj.skill.firstCooldownTime * (1 - charObj.c.cooldownTimeReduction * 0.01);
}

function getAlly() {
    var ally = [];
    for (var i in mGridHasChar) {
        var grid = getGridByUIValue(mGridHasChar[i]);
        if (mGridToChar[grid] != "") {
            var charObj = mGridToChar[grid];
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

function useSkillEffectForCalculateBattle(charObj, ally, enemy, skillEffect) {
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
    } else if (skillUsedBy == CHAR_SKILL_PASSIVE) {
        skill = charObj.skill.passive;
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
            //if (skillUsedBy == CHAR_SKILL && !mIsDetailCalculate && 'stack' in skill && skill.stack) tSkill[key].stack = charObj.c.skillStack;
            if ((skillUsedBy == CHAR_SKILL || skillUsedBy == CHAR_SKILL_PASSIVE)
                    && !mIsDetailCalculate && 'stackMax' in val) tSkill[key].stack = charObj.c.skillStack;
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
                } else if (tSkillTarget == "self_column_grid") {
                    var targetGrid = getColumnTargetGrid(charObj);
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

function targetsFilterByEffect(user, ally, enemy, effect) {
    var targets = [];
    if (effect.target == "self") targets = [user];
    if (effect.target == "ally") targets = ally;
    if (effect.target == "enemy" || effect.target == "enemyActiveAttacked" || effect.target == "enemyAttackAttacked") targets = [enemy];

    return targets;
}

function cleanBuff(user, ally, enemy, effect) {
    var targets = targetsFilterByEffect(user, ally, enemy, effect);

    targets.forEach(t => {
        t.cb.buff = t.cb.buff.filter(v => {
            return v.skillName != effect.buffName;
        });
    });
}

function buffStackAdd(user, ally, enemy, effect) {
    var targets = [];
    if (effect.target == "self") targets = [user];
    if (effect.target == "ally") targets = ally;
    if (effect.target == "enemy" || effect.target == "enemyActiveAttacked" || effect.target == "enemyAttackAttacked") targets = [enemy];

    targets.forEach(t => {
        t.cb.buff.filter(v => {
            return v.skillName == effect.buffName;
        }).forEach(v => {
            v.stack += effect.value;
            if (v.stack < 0) v.stack = 0;
            if ("stackMax" in v && v.stack > v.stackMax) v.stack = v.stackMax;
            v.existDuration = 0;
        });
    });
}

function useStatEffectForCalculateBattle(user, ally, enemy, effect) {
    var targets = [];
    if (effect.target == "self") targets = [user];
    if (effect.target == "ally") targets = ally;
    if (effect.target == "enemy" || effect.target == "enemyActiveAttacked" || effect.target == "enemyAttackAttacked") targets = [enemy];
    if (effect.target == "self_aura_grid") {
        var targetGrid = getAuraTargetGrid(user);
        targets = ally.filter(v => targetGrid.indexOf(v.c.selfGrid) >= 0);
    }
    if (effect.target == "allyInFrontOfMe") {
        var targetGrid = getFrontTargetGrid(user);
        targets = ally.filter(v => targetGrid.indexOf(v.c.selfGrid) >= 0);
    }
    if ("targetTypes" in effect) {
        targets = targets.filter(v => effect.targetTypes.indexOf(v.type) >= 0);
    }

    var buff = {};
    var time = 0;
    if ("time" in effect) time = effect.time;
    var multiply = 1;
    var value = effect.value;
    if (effect.attribute == "reducedDamage") value = -value;
    if ('multiplyByTypeCount' in effect) multiply = getCountByType(effect.multiplyByTypeCount);
    if (isBuffAttrPercent(effect.attribute)) {
        if (effect.type == "buff") {
            value = 0.01 * value * multiply;
        } else {
            value = -0.01 * value * multiply;
        }
    } else {
        value = value * multiply;
    }

    buff.time = time * FRAME_PER_SECOND;
    buff.infinitetime = time == 0;
    buff.existDuration = 0;
    buff.skillName = effect.name;
    buff.stack = 1;
    buff.value = value;
    if ('untilBuffEnd' in effect) buff.untilBuffEnd = effect.untilBuffEnd;
    if ('workWhenHaveBuff' in effect) buff.workWhenHaveBuff = effect.workWhenHaveBuff;
    if ('workWhenStackGreater' in effect) buff.workWhenStackGreater = effect.workWhenStackGreater;
    if ('stackType' in effect) buff.stackType = effect.stackType;
    if ("stack" in effect) buff.stack = effect.stack;

    if (mIsDetailCalculate) {
        if ('stackMax' in effect) {
            buff.stackMax = effect.stackMax;
            if ('stackUpWhenEveryTime' in effect) {
                buff.stackUpWhenEveryTime = effect.stackUpWhenEveryTime * FRAME_PER_SECOND;
            }
            if ('stackDownWhenEveryTime' in effect) {
                buff.stackDownWhenEveryTime = effect.stackDownWhenEveryTime * FRAME_PER_SECOND;
            }
            buff.stack = 0;
        }
        if ('initStack' in effect) buff.stack = effect.initStack;
    } else if ('stackMax' in effect && !mIsDetailCalculate) {
        buff.stack = user.c.skillStack;
    }

    buff.attribute = effect.attribute;

    targets.forEach(t => {
        var exist = false;
        if ('stackMax' in effect) {
            var sameBuff = t.cb.buff.filter(v => {
                if (v.skillName == effect.name && v.attribute == effect.attribute) {
                    return true;
                }
                return false;
            });

            if (sameBuff.length > 0) {
                exist = true;
                sameBuff.forEach(v => {
                    v.time = time * FRAME_PER_SECOND;
                    if ('stackAdd' in effect)
                        v.stack += effect.stackAdd;
                    else
                        v.stack++;
                    if (v.stack > effect.stackMax) v.stack = effect.stackMax;
                    if (v.stack < 0) v.stack = 0;
                })
            }
        }

        if ('cleanBuff' in effect) {
            var clean = effect.cleanBuff;
            if (effect.cleanBuff == "same") {
                clean = effect.name;
            }

            t.cb.buff = t.cb.buff.filter(v => v.skillName != clean);
        }

        if (!exist) t.cb.buff.push(copyObject(buff));
    });
}

function getCountByType(type) {
    var ally = getAlly();
    ally = ally.filter((v) => {
        return v.type == type;
    });

    return ally.length;
}

function getAllyCount() {
    return getAlly().length;
}

function isBuffAttrPercent(key) {
    return SKILL_TYPE_IS_PERCENT.indexOf(key) >= 0;
}

function updateForSkillCalculateBattle(skillEffect, targets, time, effectType) {
    $.each(skillEffect, function(key, val) {
        if (key != "time") {
            var buff = {};
            //var time = time;
            var multiply = 1;
            var value = val.val;
            if (key == "reducedDamage") value = -value;
            if ('multiplyByTypeCount' in val) multiply = getCountByType(val.multiplyByTypeCount);
            if (isBuffAttrPercent(key)) {
                if (effectType == "buff") {
                    value = 0.01 * value * multiply;
                } else {
                    value = -0.01 * value * multiply;
                }
            } else {
                value = value * multiply;
            }

            buff.time = time * FRAME_PER_SECOND;
            buff.infinitetime = time == 0;
            buff.existDuration = 0;
            buff.skillName = val.name;
            buff.stack = 1;
            buff.value = value;
            if ("stack" in val) buff.stack = val.stack;

            if ('stackMax' in val && mIsDetailCalculate) {
                buff.stackMax = val.stackMax;
                if ('stackUpWhenEveryTime' in val) {
                    buff.stackUpWhenEveryTime = val.stackUpWhenEveryTime * FRAME_PER_SECOND;
                }
                buff.stack = 0;
                if ('initStack' in val) buff.stack = val.initStack;
            }

            buff.attribute = key;

            targets.forEach(t => {
                var exist = false;
                if ('stackMax' in val) {
                    var sameBuff = t.cb.buff.filter(v => {
                        if (v.skillName == val.name && v.attribute == key) {
                            return true;
                        }
                        return false;
                    });

                    if (sameBuff.length > 0) {
                        exist = true;
                        sameBuff.forEach(v => {
                            v.time = time * FRAME_PER_SECOND;
                            v.stack++;
                            if (v.stack > val.stackMax) v.stack = val.stackMax;
                        })
                    }
                }

                if ('cleanBuff' in val) {
                    var clean = val.cleanBuff;
                    if (val.cleanBuff == "same") {
                        clean = val.name;
                    }

                    t.cb.buff = t.cb.buff.filter(v => v.skillName != clean);
                }

                if (!exist) t.cb.buff.push(copyObject(buff));
            });
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
    charObj.cb.buff.forEach(v => {
        if ('stackUpWhenEveryTime' in v) {
            if (v.existDuration > 0 && v.existDuration % v.stackUpWhenEveryTime == 0) {
                v.stack++;
                if (v.stack > v.stackMax) v.stack = v.stackMax;
            }
        }
        if ('stackDownWhenEveryTime' in v) {
            if (v.existDuration > 0 && v.existDuration % v.stackDownWhenEveryTime == 0) {
                v.stack--;
                if (v.stack < 0) v.stack = 0;
            }
        }
        v.existDuration++;
    });

    charObj.cb.buff = charObj.cb.buff.filter(v => {
        if (v.infinitetime) {
            return true;
        } else {
            return v.time-- > 0;
        }
    });

    charObj.cb.buff = charObj.cb.buff.filter(v => {
        if ('untilBuffEnd' in v) {
            return isHaveBuff(charObj, v.untilBuffEnd);
        } else {
            return true;
        }
    });

    charObj.cb.buff.filter(workWhenHaveBuffFilter(charObj)).filter(v => {
        if ("workWhenStackGreater" in v) {
            return v.stack > v.workWhenStackGreater;
        }
        return true;
    }).forEach(v => {
        if (v.attribute == "attackTimes" || v.attribute == "criAttack") {
            charObj.cb.attr[v.attribute] = v.value;
        } else if (v.attribute == "ammoCount" || v.attribute == "shield") {
            charObj.cb[v.attribute] += v.value;
            v.time = -1;
            v.infinitetime = false;
        } else if (isBuffAttrPercent(v.attribute)) {
            if (v.stackType == COUNT) {
                charObj.cb.attr[v.attribute] = charObj.cb.attr[v.attribute] * (1 + v.value * v.stack);
            } else {
                for (var i = 0; i < v.stack; i++) {
                    charObj.cb.attr[v.attribute] = charObj.cb.attr[v.attribute] * (1 + v.value);
                }
            }
        }
    });

//    charObj.cb.attr.dmg = Math.floor(charObj.cb.attr.dmg);
    charObj.cb.attr.hit = Math.max(1, Math.floor(charObj.cb.attr.hit));
    charObj.cb.attr.dodge = Math.floor(charObj.cb.attr.dodge);
    charObj.cb.attr.fireOfRate = Math.floor(charObj.cb.attr.fireOfRate);
    charObj.cb.attr.criRate = charObj.cb.attr.criRate;
    charObj.cb.attr.armor = Math.floor(charObj.cb.attr.armor);

    if (charObj.type == "rf" || charObj.type == "ar") charObj.cb.attr.fireOfRate = Math.min(charObj.cb.attr.fireOfRate, 120);
    else if (charObj.type == "sg") charObj.cb.attr.fireOfRate = Math.min(charObj.cb.attr.fireOfRate, 60);
    else if (charObj.type != "mg") charObj.cb.attr.fireOfRate = Math.min(charObj.cb.attr.fireOfRate, 120);
    charObj.cb.attr.criRate = Math.min(charObj.cb.attr.criRate, 100);

    if (battleisNight) {
        charObj.cb.attr.hit *= 1.0 - (0.9 * 0.01 * Math.max(100 - charObj.c.nightSight * 1, 0));
        //no sure to floor?
        charObj.cb.attr.hit = Math.floor(charObj.cb.attr.hit);
    }
}

function calculateHitRate(charObj, enemy) {
    charObj.cb.attr.hitRate = charObj.cb.attr.hit / (charObj.cb.attr.hit + enemy.cb.attr.dodge);
}

function getCriAttackExpectedValue(criRate, criDmg) {
    criRate = Math.min(criRate, 100);
    criRate = Math.max(criRate, 0);
    return 1 - criRate * 0.01 + (criDmg / 100.0) * criRate * 0.01;
}

function calculateActionDmg(charObj, enemy, mode) {
    var isCanCri = true;
    var attackMultiplyWithLinks = 1.0;
    var link = 1;
    var attackTimes = 1;
    var isCertainToHit = false;
    var isIgnoreArmor = false;
    var attackList = [];
    var attackNoLinkList = [];

    if ('attackTimes' in charObj.cb.attr) {
        attackTimes = charObj.cb.attr.attackTimes;
    }

    if ('criAttack' in charObj.cb.attr) {
        charObj.cb.attr.criRate = Math.max(charObj.cb.attr.criRate, 100);
    }

    if ('everyAttackTimesOnNext' in charObj.skill && mode == ACTION) {
        var skillEveryAttackTimesOnNext = parseInt(charObj.skill.everyAttackTimesOnNext);
        if (charObj.cb.attackedTimes == skillEveryAttackTimesOnNext) {
            attackMultiplyWithLinks = getSkillAttrValByLevel(charObj, "attack");
            isCanCri = false;
        }
    }

    if ('everyAttack' in charObj.skill) {
        if ('extraAttack' in charObj.skill.effect) {
            var rate = getSkillAttrValByLevel(charObj, "extraAttack", "rate");
            //extraAttack = getCriAttackExpectedValue(100, charObj.cb.attr.criDmg) * rate * 0.01;
            attackList.push(1.5 * rate * 0.01);
        }
    }

    getFilterEffects(charObj).filter(v => v.filter == "attack" && v.type == "attack").forEach(v => {
        var r = 0;
        if ('targetWithBuff' in v) {
            if (isHaveBuff(enemy, v.targetWithBuff))
                r = v.value;
        } else if ('targetNotWithBuff' in v) {
            if (!isHaveBuff(enemy, v.targetNotWithBuff))
                r = v.value;
        } else {
            r = v.value;
        }

        if ('allLinkDo' in v) {
            if (v.allLinkDo)
                attackList.push(r);
            else
                attackNoLinkList.push(r);
        } else {
            attackList.push(r);
        }
    });

    getFilterEffects(charObj).filter(v => v.filter == "attackReplace" && v.type == "attack").forEach(v => {
        attackMultiplyWithLinks = v.value;
        if (v.canCri === true || v.canCri === false) isCanCri = v.canCri;
        if (v.certainToHit === true || v.certainToHit === false) isCertainToHit = v.certainToHit;
        if (v.ignoreArmor === true || v.ignoreArmor === false) isIgnoreArmor = v.ignoreArmor;
    });


    if (mDmgLinkMode == MULTI_LINK) {
        link = charObj.c.link;
    }

    var criAttackE = getCriAttackExpectedValue(charObj.cb.attr.criRate, charObj.cb.attr.criDmg);
    var harm = charObj.cb.attr.dmg * attackMultiplyWithLinks;
    if (!isIgnoreArmor) {
        harm = Math.max(1, harm + Math.min(2, charObj.c.armorPiercing - enemy.cb.attr.armor));
    }
    if (isCanCri) harm *= criAttackE;
    if (!isCertainToHit) harm *= charObj.cb.attr.hitRate;
    harm = harm * enemy.cb.attr.reducedDamage * link * attackTimes;
    harm += attackNoLinkList.filter(v => v > 0).map(v => {
        v *= charObj.cb.attr.dmg;
        v = Math.max(1, v + Math.min(2, charObj.c.armorPiercing - enemy.cb.attr.armor));
        v *= criAttackE;
        v *= charObj.cb.attr.hitRate;
        return v * enemy.cb.attr.reducedDamage;
    }).reduce((t, v) => t + v, 0);
    harm += attackList.filter(v => v > 0).map(v => {
        v *= charObj.cb.attr.dmg;
        v = Math.max(1, v + Math.min(2, charObj.c.armorPiercing - enemy.cb.attr.armor));
        v *= criAttackE;
        v *= charObj.cb.attr.hitRate;
        return v * enemy.cb.attr.reducedDamage * link;
    }).reduce((t, v) => t + v, 0);
    charObj.cb.attr.dmg_single = harm;
    if (mode == ACTION) {
        charObj.cb.attr.dmg_frame = charObj.cb.attr.dmg_single;
    } else if (mode == PERFORMANCE) {
        charObj.cb.attr.attackFrame = getAttackFrame(charObj);
        var attackTimesPerSecond = 30.0 / charObj.cb.attr.attackFrame;
        charObj.cb.attr.dps = charObj.cb.attr.dmg_single * attackTimesPerSecond;
        charObj.cb.skillAttack = charObj.cb.skillAttack * charObj.cb.attr.dmg * enemy.cb.attr.reducedDamage;
        if ('radius' in charObj.skill) {
        } else {
            charObj.cb.skillAttack *= link;
        }

        if (charObj.c.isUseSkill) {
            getFilterEffects(charObj).filter(v => (v.filter == "active" || v.filter == "otherActive") && v.type == "attack")
                    .filter(targetFilter).forEach(v => {
                charObj.cb.skillAttack = v.value * charObj.cb.attr.dmg * enemy.cb.attr.reducedDamage;
                if (v.fixedDmg) charObj.cb.skillAttack = v.value;
                if (v.allLinkDo) charObj.cb.skillAttack *= link;
            });
        }
    }
}

function battleAttackSimulationResult(charObj, enemy) {
    var isCanCri = true;
    var attackMultiply = 1.0;
    var link = 1;
    var dmgTimes = 1;
    var isCertainToHit = false;
    var isIgnoreArmor = false;

    if ('attackTimes' in charObj.cb.attr) {
        dmgTimes = charObj.cb.attr.attackTimes;
    }

    if ('criAttack' in charObj.cb.attr) {
        charObj.cb.attr.criRate = Math.max(charObj.cb.attr.criRate, 100);
    }

    if ('everyAttackTimesOnNext' in charObj.skill) {
        var skillEveryAttackTimesOnNext = parseInt(charObj.skill.everyAttackTimesOnNext);
        if (charObj.cb.attackedTimes == skillEveryAttackTimesOnNext) {
            attackMultiply = getSkillAttrValByLevel(charObj, "attack");
            isCanCri = false;
        }
    }

    getFilterEffects(charObj).filter(v => v.filter == "attackReplace" && v.type == "attack").forEach(v => {
        attackMultiply = v.value;
        if (v.canCri === true || v.canCri === false) isCanCri = v.canCri;
        if (v.certainToHit === true || v.certainToHit === false) isCertainToHit = v.certainToHit;
        if (v.ignoreArmor === true || v.ignoreArmor === false) isIgnoreArmor = v.ignoreArmor;
    });

    if (mDmgLinkMode == MULTI_LINK) {
        link = charObj.c.link;
    }

    var totalDmgTimes = dmgTimes * link;
    var totalDmg = 0;
    var criRate = 0;
    if (isCanCri) criRate = charObj.cb.attr.criRate;
    totalDmg += battleAttackSimulationHarm(charObj, enemy, attackMultiply, criRate, totalDmgTimes, isCertainToHit, isIgnoreArmor);
    return totalDmg;
}

function simulationLink(charObj) {
    var link = 1;
    if (mDmgLinkMode == MULTI_LINK) {
        link = charObj.c.link;
    }

    return link;
}

function battleAttackSimulationHarm(attacker, target, attackMultiply, criRate, times, isCertainToHit, isIgnoreArmor) {
    var result = [];
    for (var i = 1; i <= times; i++) {
        if (isCertainToHit || mRandom.bool(attacker.cb.attr.hitRate)) {
            var isCriDmg = mRandom.bool(criRate / 100.0);
            var harm = attacker.cb.attr.dmg * dmgRandomRange() * attackMultiply;
            if (!isIgnoreArmor) {
                harm = Math.ceil(Math.max(1, harm + Math.min(2, attacker.c.armorPiercing - target.cb.attr.armor)));
            }
            if (isCriDmg) harm = harm * (attacker.cb.attr.criDmg / 100.0);
            result.push(Math.ceil(harm * target.cb.attr.reducedDamage));
        } else {
            result.push(0);
        }
    }

    return result.reduce((t, v) => {
        return t + v;
    }, 0);
}

function dmgRandomRange() {
    var r = mRandom.integer(85, 115);
    return r / 100.0;
}

function enemyInit(enemy) {
    var enemyDodge = $('.battle_control .enemyDodge').val();
    if (enemyDodge == "") {
        enemyDodge = 0;
    }

    var enemyArmor = $('.battle_control .enemyArmor').val();
    if (enemyArmor == "") {
        enemyArmor = 0;
    }

    enemy.id = "enemy";
    enemy.c.dodge = enemyDodge * 1;
    enemy.c.armor = enemyArmor * 1;
    enemy.cb = copyObject(enemy.c);
    enemy.cb.buff = [];
}

function allyInit(ally) {
    var battleFortress = $('.battle_control .battleFortress').is(":checked");
    var fortressLevel = $('.battle_control .fortress_level').val();

    updateCharObsForBase();
    updateCharObsForFairyAura();
    updateCharObsForAura();

    for (var i in ally) {
        var charObj = ally[i];
        charObj.cb = copyObject(charObj.c);
        charObj.cb.attr = copyObject(charObj.c);
        charObj.cb.actionFrame = getAttackFrame(charObj);
        charObj.cb.actionType = "attack";
//        charObj.cb.skillCD = getSkillFirstCooldownTime(charObj) * 30 - walkTime;
        charObj.cb.skillCD = getSkillFirstCooldownTime(charObj) * 30;
        charObj.cb.skillUsedTimes = 0;
        charObj.cb.attackedTimes = 0;
        charObj.cb.buff = [];
        charObj.cb.battleTimer = [];
        var skillType = charObj.skill.type;
        if (skillType == "activeWithPassive") {
            usePassiveSkillForCalculateBattle(charObj);
        }

        getFilterEffects(charObj).filter(v => v.filter == "battleStart" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
            useStatEffectForCalculateBattle(charObj, ally, null, v);
        });
        getFilterEffects(charObj).filter(v => v.filter == "whenEveryXSeconds").forEach(v => {
            var effectTimer = copyObject(v);
            effectTimer.timer = 0;
            effectTimer.interval = effectTimer.whenEveryXSeconds * FRAME_PER_SECOND;
            charObj.cb.battleTimer.push(effectTimer);
        });
    }

    if (mFairy != null) {
        useFairyMasteryForCalculateBattle(mFairy, ally);
        if ("effects" in mFairy.skill && mFairy.isUseSkill) {
            getFairyEffects(mFairy).filter(v => v.filter == "active" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                useStatEffectForCalculateBattle(charObj, ally, null, v);
            });
        } else if (mFairy.isUseSkill && mFairy.skill.type == BUFF) {
            useFairySkillForCalculateBattle(mFairy, ally, null);
        }
    }
    if (battleFortress) {
        useFortressForCalculateBattle(ally, fortressLevel);
    }
}

function isHaveBuff(t, name) {
    return t.cb.buff.filter(v => {
        if (v.skillName == name) {
            return true && v.stack > 0;
        }
        return false;
    }).length > 0;
}

function isHaveBuffStackGreaterOrEqual(t, name, n) {
    return t.cb.buff.filter(v => {
        if (v.skillName == name) {
            return v.stack >= n;
        }
        return false;
    }).length > 0;
}

function battleSimulation(endTime, walkTime, ally, enemy, isSimulation) {
    var enemyCount = $('.battle_control .enemyCount').val();
    if ($.isNumeric(enemyCount)) {
        enemyCount = parseInt(enemyCount);
    } else {
        enemyCount = 1;
    }
    var dmgTable = {};
    dmgTable.x = [];
    dmgTable.y = [];

    for (var i in ally) {
        dmgTable.y[i] = {};
        dmgTable.y[i]["name"] = ally[i].name;
        dmgTable.y[i]["data"] = [];
        dmgTable.y[i]["data"][0] = 0;
    }

    for (var nowFrame = 1; nowFrame <= walkTime; nowFrame++) {
        for (var i in ally) {
            var charObj = ally[i];
            charObj.cb.skillCD--;
            charObj.cb.battleTimer.forEach(v => {
                v.timer++;
            });
            updateAttrBeforAction(charObj);
        }
    }

    dmgTable.x.push(0);
    for (var nowFrame = 1; nowFrame <= endTime; nowFrame++) {
        dmgTable.x.push(parseInt((nowFrame / 30.0 * 100)) / 100.0);

        for (var i in ally) {
            var charObj = ally[i];
            charObj.cb.skillCD--;
            charObj.cb.battleTimer.forEach(v => {
                v.timer++;
                if (v.timer >= v.interval) {
                    useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                    v.timer = 0;
                }
            });
            if (charObj.c.isUseSkill) {
                if ("effects" in charObj.skill) {
                    if (charObj.cb.skillCD <= 0 && charObj.cb.actionType == "attack") {
                        getFilterEffects(charObj).filter(v => v.filter == "active" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                            useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                        });
                        getFilterEffects(charObj).filter(v => v.filter == "active" && v.type == "attack").forEach(v => {
                            charObj.cb.actionType = USE_ATTACK_SKILL;
                            charObj.cb.actionFrame = 0;
                            if ('prepareTime' in v) {
                                charObj.cb.actionType = PREPARE_TO_USE_SKILL;
                                charObj.cb.actionFrame = v.prepareTime * FRAME_PER_SECOND + 1;
                            }
                        });

                        getFilterEffects(charObj).filter(v => v.filter == "active").forEach(v => {
                            charObj.cb.skillCD = getSkillCooldownTime(charObj.skill, charObj.c.skillLevel, charObj.c.cooldownTimeReduction) * FRAME_PER_SECOND;
                            charObj.cb.skillUsedTimes = 0;
                        });
                        getFilterEffects(charObj).filter(v => v.filter == "active" && v.type == "buffStackAdd").forEach(v => {
                            buffStackAdd(charObj, ally, enemy, v);
                        });
                    }
                    getFilterEffects(charObj).filter(v => v.filter == "otherActive").forEach(v => {
                        if (v.type == "attack") {
                            charObj.cb.actionType = USE_ATTACK_SKILL;
                            charObj.cb.actionFrame = 0;
                            if ('prepareTime' in v) {
                                charObj.cb.actionType = PREPARE_TO_USE_SKILL;
                                charObj.cb.actionFrame = v.prepareTime * FRAME_PER_SECOND + 1;
                            }
                        }
                    });
                } else {
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
        }

        updateAttrBeforAction(enemy);
        for (var i in ally) {
            var charObj = ally[i];
            updateAttrBeforAction(charObj);
        }

        for (var i in ally) {
            var charObj = ally[i];
            var harmThisFrame = 0;
            charObj.cb.actionFrame--;
            if (charObj.cb.actionFrame <= 0) {
                if (charObj.cb.actionType == "attack") {
                    getFilterEffects(charObj).filter(v => v.filter == "preAttack" && v.type == "buffStackAdd").forEach(v => {
                        if ("rate" in v) {
                            if (isSimulation && mRandom.bool(v.rate * 0.01)) {
                                buffStackAdd(charObj, ally, enemy, v);
                            }
                        } else {
                            buffStackAdd(charObj, ally, enemy, v);
                        }
                    });
                    getFilterEffects(charObj).filter(v => v.filter == "otherActive").forEach(v => {
                        if (v.type == "attack") {
                            charObj.cb.actionType = USE_ATTACK_SKILL;
                            charObj.cb.actionFrame = 0;
                            if ('prepareTime' in v) {
                                charObj.cb.actionType = PREPARE_TO_USE_SKILL;
                                charObj.cb.actionFrame = v.prepareTime * FRAME_PER_SECOND + 1;
                            }
                        }
                    });
                }
                if (charObj.cb.actionType == "attack") {
                    calculateHitRate(charObj, enemy);
                    if (isSimulation) {
                        harmThisFrame += battleAttackSimulationResult(charObj, enemy);
                    } else {
                        calculateActionDmg(charObj, enemy, ACTION);
                        harmThisFrame += charObj.cb.attr.dmg_frame;
                    }

                    var resetAttackedTimes = false;
                    if ('everyAttackTimesOnNext' in charObj.skill) {
                        var skillEveryAttackTimesOnNext = parseInt(charObj.skill.everyAttackTimesOnNext);
                        if (charObj.cb.attackedTimes == skillEveryAttackTimesOnNext) {
                            resetAttackedTimes = true;
                        }
                    }

                    if ('everyAttack' in charObj.skill) {
                        if ('extraAttack' in charObj.skill.effect) {
                            var rate = getSkillAttrValByLevel(charObj, "extraAttack", "rate") * 0.01;
                            if (isSimulation && mRandom.bool(rate)) {
                                harmThisFrame += battleAttackSimulationHarm(charObj, enemy, 1.5, charObj.cb.attr.criRate, simulationLink(charObj), false, false);
                            }
                        }
                    }

                    if (EVERY_ATTACK_CHANCE in charObj.skill) {
                        if (isSimulation && mRandom.bool(0.01 * parseInt(charObj.skill[EVERY_ATTACK_CHANCE]))) {
                            var skillEffect = getSkillByLevel(charObj.skill.passive.effect, charObj.c.skillLevel);
                            useSkillForCalculateBattle2(charObj, ally, enemy, skillEffect, CHAR_SKILL_PASSIVE);
                        }
                    }
                    if (isSimulation) {
                        getFilterEffects(charObj).filter(v => v.filter == "attack" && v.type == "attack").forEach(v => {
                            var allLinkDo = true;
                            if (v.allLinkDo === true || v.allLinkDo === false) allLinkDo = v.allLinkDo;
                            var link = allLinkDo ? simulationLink(charObj) : 1;
                            if ('targetWithBuff' in v) {
                                if (isHaveBuff(enemy, v.targetWithBuff))
                                    harmThisFrame += battleAttackSimulationHarm(charObj, enemy, v.value, charObj.cb.attr.criRate, link, false, false);
                            } else if ('targetNotWithBuff' in v) {
                                if (!isHaveBuff(enemy, v.targetNotWithBuff))
                                    harmThisFrame  += battleAttackSimulationHarm(charObj, enemy, v.value, charObj.cb.attr.criRate, link, false, false);
                            } else {
                                harmThisFrame += battleAttackSimulationHarm(charObj, enemy, v.value, charObj.cb.attr.criRate, link, false, false);
                            }
                        });
                    }
                    getFilterEffects(charObj).filter(v => v.filter == "attack" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                        useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                    });
                    getFilterEffects(charObj).filter(v => v.filter == "firstAttackEveryXTimes").filter(v => charObj.cb.attackedTimes % v.everyXTimes == 0)
                            .filter(v => v.type == "buff" || v.type == "debuff").forEach(v => {
                        useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                    });
                    getFilterEffects(charObj).filter(v => v.filter == "attack" && v.type == "buffStackAdd").forEach(v => {
                        if ("rate" in v) {
                            if (isSimulation && mRandom.bool(v.rate * 0.01)) {
                                buffStackAdd(charObj, ally, enemy, v);
                            }
                        } else {
                            buffStackAdd(charObj, ally, enemy, v);
                        }
                    });
                    getFilterEffects(charObj).filter(v => v.filter == "attack" && v.type == "cleanBuff").forEach(v => {
                        cleanBuff(charObj, ally, enemy, v);
                    });
                    getFilterEffects(charObj).filter(v => v.filter == "attackAttacked").forEach(v => {
                        useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                    });

                    charObj.cb.attackedTimes++;
                    getFilterEffects(charObj).filter(v => v.filter == "attackedTimes" && charObj.cb.attackedTimes == v.attackedTimes && v.type == "cleanBuff").forEach(v => {
                        cleanBuff(charObj, ally, enemy, v);
                    });
                    if (resetAttackedTimes) charObj.cb.attackedTimes = 0;
                    charObj.cb.actionFrame = getAttackFrame(charObj);
                    if (charObj.type == "mg" || charObj.type == "sg") {
                        charObj.cb.ammoCount--;
                        if (charObj.cb.ammoCount <= 0) {
                            var changeAmmoCountFrame = 0;
                            if (charObj.type == "mg") changeAmmoCountFrame = getMgChangeAmmoCountFrame(charObj.cb.attr.fireOfRate);
                            if (charObj.type == "sg") changeAmmoCountFrame = getSgChangeAmmoCountFrame(charObj.c.ammoCount);
                            changeAmmoCountFrame += FRAME_PER_SECOND * charObj.cb.buff.reduce((r, v) => {
                                if (v.attribute == "changeAmmoTime") {
                                    v.time = -1;
                                    v.infinitetime = false;
                                    return r + v.value;
                                }
                                return r;
                            }, 0);
                            getFilterEffects(charObj).filter(v => v.filter == "changeAmmo" && v.type == "changeAmmoTime").forEach(v => {
                                changeAmmoCountFrame = v.value * FRAME_PER_SECOND;
                            });
                            charObj.cb.actionFrame = changeAmmoCountFrame;
                            charObj.cb.actionType = "changeAmmoCount";

                            if ('everyChangeAmmoCount' in charObj.skill) {
                                useSkillForCalculateBattle(charObj, ally, null);
                            }
                            getFilterEffects(charObj).filter(v => v.filter == "changeAmmo" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                                useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                            });
                        }
                    }
                } else if (charObj.cb.actionType == "changeAmmoCount") {
                    charObj.cb.ammoCount = charObj.c.ammoCount;
                    charObj.cb.actionFrame = getAttackFrame(charObj);
                    charObj.cb.actionType = "attack";
                    charObj.cb.attackedTimes = 0;
                } else if (charObj.cb.actionType == PREPARE_TO_USE_SKILL || charObj.cb.actionType == USE_ATTACK_SKILL) {
                    charObj.cb.skillUsedTimes++;
                    if ("effects" in charObj.skill) {
                        var enemyActiveAttacked = enemyCount;
                        getFilterEffects(charObj).filter(v => (v.filter == "active" || v.filter == "otherActive") && v.type == "attack")
                                .filter(targetFilter).forEach(v => {
                            var attackMultiply = v.value;
                            var link = 1;
                            if (mDmgLinkMode == MULTI_LINK && v.allLinkDo) {
                                link = charObj.c.link;
                            }

                            if (v.fixedDmg)
                                harmThisFrame += parseInt(v.value * link);
                            else
                                harmThisFrame += parseInt(charObj.cb.attr.dmg * attackMultiply * link * enemy.cb.attr.reducedDamage);

                            if ('skillTimes' in v && charObj.cb.skillUsedTimes < v.skillTimes) {
                                charObj.cb.actionType = PREPARE_TO_USE_SKILL;
                                if ('prepareTime' in v) {
                                    charObj.cb.actionFrame = v.prepareTime * 30;
                                } else {
                                    charObj.cb.actionFrame = 1 * 30;
                                }
                            } else if (v.postReloadTime > 0) {
                                charObj.cb.actionFrame = v.postReloadTime * FRAME_PER_SECOND;
                                charObj.cb.actionType = PREPARE_TO_ATTACK;
                            } else {
                                charObj.cb.actionFrame = 12;
                                charObj.cb.actionType = "attack";
                            }

                        });
                        getFilterEffects(charObj).filter(v => v.filter == "activeAttacked").forEach(v => {
                            if (v.type == "buffStackAdd") {
                                buffStackAdd(charObj, ally, enemy, v);
                            } else {
                                if ('countGreaterOrEqual' in v && enemyActiveAttacked >= v.countGreaterOrEqual) {
                                    useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                                }

                                if ("countLess" in v && enemyActiveAttacked < v.countLess) {
                                    useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                                }
                            }
                        });
                    } else {
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

                        harmThisFrame += parseInt(charObj.cb.attr.dmg * attackMultiply * link * enemy.cb.attr.reducedDamage);

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
                } else if (charObj.cb.actionType == PREPARE_TO_ATTACK) {
                    charObj.cb.actionFrame = getAttackFrame(charObj);
                    charObj.cb.actionType = "attack";
                    charObj.cb.attackedTimes = 0;
                }
            }
            dmgTable.y[i]["data"][nowFrame] = dmgTable.y[i]["data"][nowFrame - 1] + harmThisFrame;
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

    var enemyCount = $('.battle_control .enemyCount').val();
    if ($.isNumeric(enemyCount)) {
        enemyCount = parseInt(enemyCount);
    } else {
        enemyCount = 1;
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

    var enemyActiveAttacked = enemyCount;
    updateCharObsForUseSkill();
    ally.forEach(charObj => {
        if ("effects" in charObj.skill) {
            getFilterEffects(charObj).filter(v => v.filter == "battleStart" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                useStatEffectForCalculateBattle(charObj, ally, null, v);
            });

            if (charObj.c.isUseSkill) {
                getFilterEffects(charObj).filter(v => v.filter == "active" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                    useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                });
                getFilterEffects(charObj).filter(v => v.filter == "active" && v.type == "buffStackAdd").forEach(v => {
                    buffStackAdd(charObj, ally, enemy, v);
                });

                getFilterEffects(charObj).filter(v => v.filter == "activeAttacked").forEach(v => {
                    if (v.type == "buffStackAdd" && v.value > 0) {
                        buffStackAdd(charObj, ally, enemy, v);
                    } else {
                        if ('countGreaterOrEqual' in v && enemyActiveAttacked >= v.countGreaterOrEqual) {
                            useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                        }

                        if ("countLess" in v && enemyActiveAttacked < v.countLess) {
                            useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                        }
                    }
                });

                getFilterEffects(charObj).filter(v => v.filter == "attackAttacked").forEach(v => {
                    useStatEffectForCalculateBattle(charObj, ally, enemy, v);
                });
            }
            getFilterEffects(charObj).filter(v => v.filter == "attack" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                useStatEffectForCalculateBattle(charObj, ally, enemy, v);
            });
        }
    });
    if (mFairy != null) {
        useFairyMasteryForCalculateBattle(mFairy, ally);
        if ("effects" in mFairy.skill && mFairy.isUseSkill) {
            getFairyEffects(mFairy).filter(v => v.filter == "active" && (v.type == "buff" || v.type == "debuff")).forEach(v => {
                useStatEffectForCalculateBattle(charObj, ally, enemy, v);
            });
        } else if (mFairy.isUseSkill && mFairy.skill.type == BUFF) {
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
        var e = 0;
        if ("0" in val)
            e = val["0"];
        else
            e = Math.floor((1 * val["5"] - 1 * val["1"]) / 4 * (link - 1) + 1 * val["1"]);
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
                var u = skillLevel + 1;
                while (true) {
                    if (u in val) {
                        break;
                    } else {
                        u += 1;
                    }
                }

                var d = skillLevel - 1;
                while (true) {
                    if (d in val) {
                        break;
                    } else {
                        d -= 1;
                    }
                }
                var e = (1.0 * val[u] - 1.0 * val[d]) / (u - d) * (skillLevel - d) + 1.0 * val[d];
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
