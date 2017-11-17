function getCharSkillDetail(charT) {
    var detailText = null;
    if (charT.skillLevel in charT.skill.detailText) {
        detailText = charT.skill.detailText[charT.skillLevel];
    } else {
        detailText = charT.skill.detailText["val"];
    }

    var text = [];
    var skillEffect = getSkillByLevel(charT.skill.effect, charT.c.skillLevel);
    if (charT.id == "183") text.push(getCharSkillDetailId183(skillEffect, detailText));
    if (charT.id == "188") text.push(getCharSkillDetailId188(skillEffect, detailText));
    if (charT.id == "1001") text.push(getCharSkillDetailId1001(skillEffect, detailText));
    if (charT.id == "1002") text.push(getCharSkillDetailId1002(skillEffect, detailText));
    if (charT.id == "1004") text.push(getCharSkillDetailId1004(skillEffect, detailText));
    return text;
}

function getCharSkillDetailId183(skillEffect, detailText) {
    return detailText.format(skillEffect.attack.val, skillEffect.reducedDamage.val, skillEffect.time.val);
}

function getCharSkillDetailId188(skillEffect, detailText) {
    return detailText.format(skillEffect.shield.val, skillEffect.time.val);
}

function getCharSkillDetailId1001(skillEffect, detailText) {
    return detailText.format(skillEffect.attack.val);
}

function getCharSkillDetailId1002(skillEffect, detailText) {
    return detailText.format(skillEffect.attack.val, skillEffect.attack2.val);
}

function getCharSkillDetailId1004(skillEffect, detailText) {
    return detailText.format(skillEffect.attack.val, skillEffect.time.val);
}
//alert(JSON.stringify(charObj));
