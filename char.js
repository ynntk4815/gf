function getCharSkillDetail(charT) {
    var detailText = null;
    if (charT.skillLevel in charT.skill.detailText) {
        detailText = charT.skill.detailText[charT.skillLevel];
    } else {
        detailText = charT.skill.detailText["val"];
    }

    var detailText2 = null;
    if (charT.c.modLevel >= 2) {
        if (charT.c.mod2SkillLevel in charT.mod2Skill.detailText) {
            detailText2 = charT.mod2Skill.detailText[charT.c.mod2SkillLevel];
        } else {
            detailText2 = charT.mod2Skill.detailText["val"];
        }
    }

    var text = [];
    var skillEffect = getSkillByLevel(charT.skill.effect, charT.c.skillLevel);
    var pSkillEffect = null;
    if ('passive' in charT.skill) {
        pSkillEffect = getSkillByLevel(charT.skill.passive.effect, charT.c.skillLevel);
    }
    if (charT.id == "183") text.push(getCharSkillDetailId183(skillEffect, detailText));
    if (charT.id == "188") text.push(getCharSkillDetailId188(skillEffect, detailText));
    if (charT.id == "189") text.push(getCharSkillDetailId189(charT, detailText));
    if (charT.id == "196") text.push(getCharSkillDetailId196(charT, detailText));
    if (charT.id == "197") text.push(getCharSkillDetailId197(skillEffect, pSkillEffect, detailText));
    if (charT.id == "203") text.push(getCharSkillDetailId203(charT, detailText));
    if (charT.id == "207") text.push(getCharSkillDetailId207(charT, detailText));
    if (charT.id == "1001") text.push(getCharSkillDetailId1001(skillEffect, detailText));
    if (charT.id == "1002") text.push(getCharSkillDetailId1002(skillEffect, detailText));
    if (charT.id == "1004") text.push(getCharSkillDetailId1004(skillEffect, detailText));
    if (charT.id == "20055") text.push(getCharSkillDetailId20055(charT, detailText, detailText2));
    if (charT.id == "20057") text.push(getCharSkillDetailId20057(charT, detailText, detailText2));
    return text;
}

function getCharSkillDetailId183(skillEffect, detailText) {
    return detailText.format(skillEffect.attack.val, skillEffect.reducedDamage.val, skillEffect.time.val);
}

function getCharSkillDetailId188(skillEffect, detailText) {
    return detailText.format(skillEffect.shield.val, skillEffect.time.val);
}

function getCharSkillDetailId189(charT, detailText) {
    var v0 = charT.c.skills[0].effects[0].time;
    var v1 = charT.c.skills[0].effects[0].value;
    var v2 = charT.c.skills[0].effects[1].value;
    return detailText.format(v0, v1, v2);
}

function getCharSkillDetailId196(charT, detailText) {
    var v0 = charT.c.skills[0].effects[0].value * 100;
    var v1 = charT.c.skills[0].effects[1].value;
    var v2 = charT.c.skills[0].effects[1].time;
    var v3 = charT.c.skills[0].effects[2].value;
    var v4 = charT.c.skills[0].effects[2].time;
    return detailText.format(v0, v1, v2, v3, v4);
}

function getCharSkillDetailId197(skillEffect, pSkillEffect, detailText) {
    return detailText.format(skillEffect.criRate.val, skillEffect.time.val, pSkillEffect.criRate.val);
}

function getCharSkillDetailId203(charT, detailText) {
    var v0 = charT.c.skills[0].effects[0].value;
    var v1 = charT.c.skills[0].effects[1].value;
    var v2 = charT.c.skills[0].effects[1].time;
    return detailText.format(v0, v1, v2);
}

function getCharSkillDetailId207(charT, detailText) {
    var v0 = charT.c.skills[0].effects[0].value;
    var v1 = charT.c.skills[0].effects[1].value;
    var v2 = charT.c.skills[0].effects[2].value;
    var v3 = charT.c.skills[0].effects[3].value;
    var v4 = charT.c.skills[0].effects[0].time;
    return detailText.format(v0, v1, v2, v3, v4);
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

function getCharSkillDetailId20055(charT, detailText, detailText2) {
    var result = [];
    var v0 = charT.c.skills[0].effects[0].value;
    var v1 = charT.c.skills[0].effects[0].time;

    result.push(detailText.format(v0, v1));
    if (detailText2 != null) {
        var v2 = charT.c.skills[1].effects[1].value * 100;
        result.push(detailText2.format(v2));
    }
    return result.join("<br>");
}

function getCharSkillDetailId20057(charT, detailText, detailText2) {
    var result = [];
    var v0 = charT.c.skills[0].effects[0].value;
    var v1 = charT.c.skills[0].effects[0].time;

    result.push(detailText.format(v0, v1));
    if (detailText2 != null) {
        var v2 = charT.c.skills[1].effects[0].value * 100;
        var v3 = charT.c.skills[1].effects[1].value * 100;
        result.push(detailText2.format(v2, v3));
    }
    return result.join("<br>");
}
//alert(JSON.stringify(charObj));
