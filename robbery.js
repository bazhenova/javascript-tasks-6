'use strict';

var moment = require('./moment');
var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    // 1. Читаем json
    // 2. Находим подходящий ближайший момент начала ограбления
    // 3. И записываем в appropriateMoment
    try {
        var data = JSON.parse(json);
    } catch (e) {
        throw e.name + ': ' + e.message;
    }
    var peopleTime = getPeopleTime(data);
    var bankTimes = getBankTimes(workingHours);
    var start = getIntersection(peopleTime, bankTimes, minDuration);
    if (start === -1) {
        console.log('Нет подходящего времени.');
        return appropriateMoment;
    }
    var time = appropriateMoment.takeTime(start);
    var date = appropriateMoment.getStrDate(time);
    var strDate = date.day + ' ' + date.hours + ':' + date.minutes + '+0';
    appropriateMoment.date = strDate;
    var bankTimezone = parseInt(workingHours.from.slice(-2), 10);
    appropriateMoment.timezone = bankTimezone;
    return appropriateMoment;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};

function getPeopleTime(data) {
    var peopleTime = [];
    var people = Object.keys(data);
    for (var i = 0; i < people.length; i++) {
        for (var j = 0; j < data[people[i]].length; j++) {
            peopleTime.push(getTimes(data[people[i]][j].from, data[people[i]][j].to));
        }
    }
    return peopleTime;
}

function getIntersection(peopleTime, bankTimes, minDuration) {
    for (var k = 0; k < bankTimes.length; k++) {
        var duration = -1; // продолжительность в минутах
        var bankTime = bankTimes[k];
        var start = bankTime.from;
        var finish = bankTime.from - 1;
        var suitable = true;
        for (var i = bankTime.from; i <= bankTime.to; i++) {
            for (var index = 0; index < peopleTime.length; index++) {
                var currentInterval = peopleTime[index];
                if (currentInterval.from <= i && currentInterval.to >= i) {
                    suitable = false;
                    break;
                }
            }
            if (suitable) {
                duration += 1;
                finish += 1;
            } else {
                if (start !== finish && finish - start >= minDuration) {
                    return start;
                }
                start = i;
                finish = i;
                duration = -1;
                suitable = true;
            }
        }
    }
    return -1;
}

function getBankTimes(workingHours) {
    var times = [];
    var currentMoment = moment();
    for (var i = 0; i < daysOfWeek.length; i++) {
        var start = daysOfWeek[i] + ' ' + workingHours.from;
        var finish = daysOfWeek[i] + ' ' + workingHours.to;
        times.push(getTimes(start, finish));
    }
    return times;
}

function getTimes(start, finish) {
    var startMoment = moment();
    var endMoment = moment();
    startMoment.date = start;
    endMoment.date = finish;
    return {
        from: startMoment.date,
        to: endMoment.date
    };
}
