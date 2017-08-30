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
