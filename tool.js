function tool_p(){

            $.ajaxSetup({
                async: false
            });
            $.getJSON("char.json", function(data) {
            }).fail(function() {
                alert("test2");
            });

            var resultTable = $('.tab_expedscorer .results');
            $('.tab_expedscorer .calculate_btn').click(function(){
                var numberPattern = /\d+/g;
//
                var numbers = $('.pText').val().match(numberPattern);
                resultTable.empty();

                var id = $('.priorityId').val();
                var name = $('.priorityName').val();
                var type = $('.priorityType').val();
                var rarity = $('.priorityRarity').val();
                var belt = $('.priorityBelt').val();
                var fillingBulletCount = $('.priorityFillingBulletCount').val();
                var armorLv1 = $('.priorityArmorLv1').val();
                var armorLv100 = $('.priorityArmorLv100').val();
                var skillName = $('.prioritySkillName').val();
                var skillNight = $('.prioritySkillNight').val();
                var skillType = $('.prioritySkillType').val();
                var skillTarget = $('.prioritySkillTarget').val();
                var everyAttackTimesOnNext = $('.priorityeveryAttackTimesOnNext').val();
                var firstCooldownTime = $('.priorityFirstCooldownTime').val();
                var cooldownTime1 = $('.priorityCooldownTime1').val();
                var cooldownTime10 = $('.priorityCooldownTime10').val();
                var skillRadius = $('.prioritySkillRadius').val();
                var skillPrepareTime = $('.prioritySkillPrepareTime').val();
                var skillTimes = $('.prioritySkillTimes').val();

                var skillEffect = $('.prioritySkillEffect').val();
                var skillEffectLv1 = $('.prioritySkillEffectLv1').val();
                var skillEffectLv10 = $('.prioritySkillEffectLv10').val();
                var skillEffect2 = $('.prioritySkillEffect2').val();
                var skillEffect2Lv1 = $('.prioritySkillEffect2Lv1').val();
                var skillEffect2Lv10 = $('.prioritySkillEffect2Lv10').val();

                var skillEffectTimeLv1 = $('.prioritySkillEffectTimeLv1').val();
                var skillEffectTimeLv10 = $('.prioritySkillEffectTimeLv10').val();

                var skillEffectNight = $('.prioritySkillEffectNight').val();
                var skillEffectNightLv1 = $('.prioritySkillEffectNightLv1').val();
                var skillEffectNightLv10 = $('.prioritySkillEffectNightLv10').val();
                var skillEffect2Night = $('.prioritySkillEffect2Night').val();
                var skillEffect2NightLv1 = $('.prioritySkillEffect2NightLv1').val();
                var skillEffect2NightLv10 = $('.prioritySkillEffect2NightLv10').val();

                var skillEffectTimeNightLv1 = $('.prioritySkillEffectTimeNightLv1').val();
                var skillEffectTimeNightLv10 = $('.prioritySkillEffectTimeNightLv10').val();


                var auraTarget = $('.priorityAuraTarget').val();
                var priorityAuraBuff1 = $('.priorityAuraBuff1').val();
                var priorityAuraBuff1Lv1 = $('.priorityAuraBuff1Lv1').val();
                var priorityAuraBuff1Lv5 = $('.priorityAuraBuff1Lv5').val();

                if (priorityAuraBuff1Lv5 == "") priorityAuraBuff1Lv5 = priorityAuraBuff1Lv1;

                var priorityAuraBuff2 = $('.priorityAuraBuff2').val();
                var priorityAuraBuff2Lv1 = $('.priorityAuraBuff2Lv1').val();
                var priorityAuraBuff2Lv5 = $('.priorityAuraBuff2Lv5').val();

                if (priorityAuraBuff2Lv5 == "") priorityAuraBuff2Lv5 = priorityAuraBuff2Lv1;

                var auraSelf = $('.priorityAuraSelf').val();
//
//                resultTable.append("123");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;{\"id\":\""+id+"\", \"name\":\""+name+"\", \"type\":\""+type+"\", \"rarity\":\""+rarity+"\",");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"hp\":{\"1\":\""+numbers[0]+"\", \"100\":\""+numbers[1]+"\"},");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"dmg\":{\"1\":\""+numbers[2]+"\", \"100\":\""+numbers[3]+"\"},");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"dodge\":{\"1\":\""+numbers[4]+"\", \"100\":\""+numbers[5]+"\"},");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"hit\":{\"1\":\""+numbers[6]+"\", \"100\":\""+numbers[7]+"\"},");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"fireOfRate\":{\"1\":\""+numbers[10]+"\", \"100\":\""+numbers[11]+"\"},");
                resultTable.append("<br>");
                if (belt != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"belt\":\""+belt+"\",");
                    resultTable.append("<br>");
                }
                if (fillingBulletCount != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"fillingBulletCount\":\""+fillingBulletCount+"\",");
                    resultTable.append("<br>");
                }
                if (armorLv1 != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"armor\":{\"1\":\""+armorLv1+"\", \"100\":\""+armorLv100+"\"},");
                    resultTable.append("<br>");
                }
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"skill\":{");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"name\":\""+skillName+"\",");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"type\":\""+skillType+"\",");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"target\":\""+skillTarget+"\",");
                resultTable.append("<br>");
                if (everyAttackTimesOnNext != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"everyAttackTimesOnNext\":\""+everyAttackTimesOnNext+"\",");
                    resultTable.append("<br>");
                }
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"firstCooldownTime\":\""+firstCooldownTime+"\",");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"cooldownTime\":{\"1\":\""+cooldownTime1+"\", \"10\": \""+cooldownTime10+"\"},");
                resultTable.append("<br>");
                if (skillRadius != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"radius\":\""+skillRadius+"\",");
                    resultTable.append("<br>");
                }
                if (skillPrepareTime != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"prepareTime\":\""+skillPrepareTime+"\",");
                    resultTable.append("<br>");
                }
                if (skillTimes != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"skillTimes\":\""+skillTimes+"\",");
                    resultTable.append("<br>");
                }
                if (skillNight != "nightOnly") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"effect\":{");
                    resultTable.append("<br>");
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\""+skillEffect+"\":{\"1\":\""+skillEffectLv1+"\", \"10\":\""+skillEffectLv10+"\"},");
                    resultTable.append("<br>");
                    if (skillEffect2 != "none") {
                        resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\""+skillEffect2+"\":{\"1\":\""+skillEffect2Lv1+"\", \"10\":\""+skillEffect2Lv10+"\"},");
                        resultTable.append("<br>");
                    }
                }
                if (skillNight == "n") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"time\":{\"1\":\""+skillEffectTimeLv1+"\", \"10\":\""+skillEffectTimeLv10+"\"}}},");
                } else {
                    if (skillNight == "y") {
                        resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"time\":{\"1\":\""+skillEffectTimeLv1+"\", \"10\":\""+skillEffectTimeLv10+"\"}},");
                        resultTable.append("<br>");
                    }
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"effectNight\":{");
                    resultTable.append("<br>");
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\""+skillEffectNight+"\":{\"1\":\""+skillEffectNightLv1+"\", \"10\":\""+skillEffectNightLv10+"\"},");
                    resultTable.append("<br>");
                    if (skillEffect2Night != "none") {
                        resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\""+skillEffect2Night+"\":{\"1\":\""+skillEffect2NightLv1+"\", \"10\":\""+skillEffect2NightLv10+"\"},");
                        resultTable.append("<br>");
                    }
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"time\":{\"1\":\""+skillEffectTimeNightLv1+"\", \"10\":\""+skillEffectTimeNightLv10+"\"}}},");
                }
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"aura\":{");
                resultTable.append("<br>");
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"target\":\""+auraTarget+"\", \"effect\":{");
                resultTable.append("<br>");
                if (priorityAuraBuff2Lv1 == "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\""+priorityAuraBuff1+"\":{\"1\":\""+priorityAuraBuff1Lv1+"\", \"5\":\""+priorityAuraBuff1Lv5+"\"}},");
                } else {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\""+priorityAuraBuff1+"\":{\"1\":\""+priorityAuraBuff1Lv1+"\", \"5\":\""+priorityAuraBuff1Lv5+"\"},");
                }
                resultTable.append("<br>");
                if (priorityAuraBuff2Lv1 != "") {
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\""+priorityAuraBuff2+"\":{\"1\":\""+priorityAuraBuff2Lv1+"\", \"5\":\""+priorityAuraBuff2Lv5+"\"}},");
                    resultTable.append("<br>");
                }
                if (auraSelf != "5") {
                    var x = 0;
                    var y = 0;
                    if (auraSelf == "1") {
                        x = -1;
                        y = 1;
                    }
                    if (auraSelf == "2") {
                        x = 0;
                        y = 1;
                    }
                    if (auraSelf == "3") {
                        x = 1;
                        y = 1;
                    }
                    if (auraSelf == "4") {
                        x = -1;
                        y = 0;
                    }
                    if (auraSelf == "6") {
                        x = 1;
                        y = 0;
                    }
                    if (auraSelf == "7") {
                        x = -1;
                        y = -1;
                    }
                    if (auraSelf == "8") {
                        x = 0;
                        y = -1;
                    }
                    if (auraSelf == "9") {
                        x = 1;
                        y = -1;
                    }
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"self\":{\"x\":\""+x+"\", \"y\":\""+y+"\"},");
                    resultTable.append("<br>");
                }
                resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"grid\":[");
                resultTable.append("<br>");

                var selectedGridItemsQ = $('.priorityAuraGrid input:checked');

                var i = 0;
                selectedGridItemsQ.each( function() {
                    var grid = $(this).attr("value");
                    var x = 0;
                    var y = 0;
                    if (grid == "1") {
                        x = -1;
                        y = 1;
                    }
                    if (grid == "2") {
                        x = 0;
                        y = 1;
                    }
                    if (grid == "3") {
                        x = 1;
                        y = 1;
                    }
                    if (grid == "4") {
                        x = -1;
                        y = 0;
                    }
                    if (grid == "6") {
                        x = 1;
                        y = 0;
                    }
                    if (grid == "7") {
                        x = -1;
                        y = -1;
                    }
                    if (grid == "8") {
                        x = 0;
                        y = -1;
                    }
                    if (grid == "9") {
                        x = 1;
                        y = -1;
                    }

                    if (i > 0) {
                        resultTable.append(",");
                        resultTable.append("<br>");
                    }
                    resultTable.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{\"x\":\""+x+"\", \"y\":\""+y+"\"}");

                    i++;
                });
                resultTable.append("]}}");
            });
}
//                var priorityManpower = parseInt($(".tab_expedscorer .priorityManpower").val(), 10);
//                var priorityAmmo = parseInt($(".tab_expedscorer .priorityAmmo").val(), 10);
//                var priorityRation = parseInt($(".tab_expedscorer .priorityRation").val(), 10);
//                var priorityPart = parseInt($(".tab_expedscorer .priorityPart").val(), 10);
//                var priorityQuickRepair = parseInt($(".tab_expedscorer .priorityQuickRepair").val(), 10);
//                var priorityQuickDone = parseInt($(".tab_expedscorer .priorityQuickDone").val(), 10);
//                var priorityContract = parseInt($(".tab_expedscorer .priorityContract").val(), 10);
//                var priorityEquipment = parseInt($(".tab_expedscorer .priorityEquipment").val(), 10);
//                var afkHH = parseInt($(".tab_expedscorer .afkH").val(), 10);
