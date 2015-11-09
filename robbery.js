'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    // 1. Читаем json
    // 2. Находим подходящий ближайший момент начала ограбления
    // 3. И записываем в appropriateMoment

    var data = JSON.parse(json);
    var peopleTime = getPeopleTime(data);
    var bankTimes = getBankTimes(workingHours);
    var intersections = getIntersections(peopleTime, bankTimes);
    if (intersections.length === 0) {
        console.log('Нет подходящего времени.');
        return appropriateMoment;
    }
    var neededTime = {};
    for (var i = 0; i < intersections.length; i++) {
        var intersection = intersections[i];
        if (intersection.duration >= minDuration) {
            neededTime = intersection;
            break;
        }
    }
    var date = getStrTime(takeTime(neededTime.from));
    appropriateMoment.date = date;
    var bankTimezone = parseInt(workingHours.from.slice(-2));
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

function parseDate(date) {
    var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    var day = daysOfWeek.indexOf(date.slice(0, 2));
    var zone = parseInt(date.slice(8));
    var hours = parseInt(date.slice(3, 5)) - zone; // Перевели в +0
    if (hours < 0) {
        hours += 24;
        day -= 1;
    }
    if (hours >= 24) {
        hours -= 24;
        day += 1;
    }
    day = (day < 0) ? 6 : day;
    var minutes = parseInt(date.slice(6, 8));
    return {
        day: day,
        hours: hours,
        minutes: minutes
    };
}

function getTimeInMinutes(date) {
    return (date.day * 24 + date.hours) * 60 + date.minutes; // считаем от начала недели
}

function getPeopleTime(data) {
    var peopleTime = [];
    var people = Object.keys(data);
    for (var i = 0; i < people.length; i++) {
        for (var j = 0; j < data[people[i]].length; j++) {
            peopleTime.push({
                from: getTimeInMinutes(parseDate(data[people[i]][j].from)),
                to: getTimeInMinutes(parseDate(data[people[i]][j].to))
            });
        }
    }
    return peopleTime;
}

function getIntersections(peopleTime, bankTimes) {
    var intersections = [];
    for (var k = 0; k < bankTimes.length; k++) {
        var duration = -1; // продолжительность в минутах
        var bankTime = bankTimes[k];
        var from = bankTime.from - 1;
        var to = bankTime.from - 1;
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
                to += 1;
            } else {
                if (from !== to) {
                    intersections.push({
                        duration: duration,
                        from: from,
                        to: to
                    });
                }
                from = i;
                to = i;
                duration = -1;
                suitable = true;
            }
        }
    }
    return intersections;
}

function takeTime(minutes) {
    var day = Math.floor(minutes / (60 * 24));
    minutes -= 60 * 24 * day;
    var hours = Math.floor(minutes / 60);
    minutes -= 60 * hours;
    return {
        day: day,
        hours: hours,
        minutes: minutes
    };
}

function getStrTime(date) {
    var hours = (date.hours < 10) ? '0' + date.hours : date.hours;
    var minutes = (date.minutes < 10) ? '0' + date.minutes : date.minutes;
    var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    var day = daysOfWeek[date.day];
    return day + ' ' + hours + ':' + minutes + '+0';
}

function getBankTimes(workingHours) {
    var times = [];
    var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    for (var i = 0; i < daysOfWeek.length; i++) {
        var from = daysOfWeek[i] + ' ' + workingHours.from;
        from = getTimeInMinutes(parseDate(from));
        var to = daysOfWeek[i] + ' ' + workingHours.to;
        to = getTimeInMinutes(parseDate(to));
        times.push({
            from: from,
            to: to
        });
    }
    return times;
}
