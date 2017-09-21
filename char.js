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
    return text;
}

function getCharSkillDetailId183(skillEffect, detailText) {
    return detailText.format(skillEffect.attack.val, skillEffect.reducedDamage.val, skillEffect.time.val);
}
//alert(JSON.stringify(charObj));
