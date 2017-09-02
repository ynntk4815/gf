function getFairySkillDetail(fairy) {
    var detailText = null;
    if (fairy.skillLevel in fairy.skill.detailText) {
        detailText = fairy.skill.detailText[fairy.skillLevel];
    } else {
        detailText = fairy.skill.detailText["val"];
    }

    var text = [];
    if (fairy.id == "1") text.push(getFairySkillDetailId001(fairy, detailText));
    if (fairy.id == "2") text.push(getFairySkillDetailId002(fairy, detailText));
    if (fairy.id == "3") text.push(getFairySkillDetailId003(fairy, detailText));
    if (fairy.id == "4") text.push(getFairySkillDetailId004(fairy, detailText));
    if (fairy.id == "5") text.push(getFairySkillDetailId005(fairy, detailText));
    if (fairy.id == "6") text.push(getFairySkillDetailId006(fairy, detailText));
    if (fairy.id == "7") text.push(getFairySkillDetailId007(fairy, detailText));
    if (fairy.id == "8") text.push(getFairySkillDetailId008(fairy, detailText));
    if (fairy.id == "9") text.push(getFairySkillDetailId009(fairy, detailText));
    return text;
}

function getFairyMasteryDetail(fairy) {
    var detailText = fairy.mastery.detailText["val"];
    var text = [];
    text.push(detailText);
    return text;
}

function getFairySkillDetailId001(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.dmg.val, skillEffect.fireOfRate.val);
}

function getFairySkillDetailId002(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.hit.val, skillEffect.criRate.val);
}

function getFairySkillDetailId003(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.armor.val);
}

function getFairySkillDetailId004(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.shield.val);
}

function getFairySkillDetailId005(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.reducedDamage.val);
}

function getFairySkillDetailId006(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.hp.val);
}

function getFairySkillDetailId007(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.fixedDmg.val);
}

function getFairySkillDetailId008(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.fixedDmg.val);
}

function getFairySkillDetailId009(fairy, detailText) {
    var skillEffect = getSkillByLevel(fairy.skill.effect, fairy.skillLevel);
    return detailText.format(skillEffect.fixedDmg.val);
}
