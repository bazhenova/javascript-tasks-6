'use strict';
var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        _date: {},

        get date() {
            return getTimeInMinutes(this._date);
        },

        set date(newDate) {
            this._date = parseDate(newDate);
        },

        // А здесь часовой пояс
        timezone: null,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var hours = this._date.hours + this.timezone;
            var day = this._date.day;
            var update = getCorrectHoursAndDay(hours, day);
            var newDate = {
                days: update.day,
                hours: update.hours,
                minutes: this._date.minutes
            };
            var strDate = this.getStrDate(newDate);
            return pattern
                .replace('%DD', strDate.day)
                .replace('%HH', strDate.hours)
                .replace('%MM', strDate.minutes);
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var currentTime = this.date;
            var momentTime = moment.date;
            var diff = currentTime - momentTime;
            if (diff > 0) {
                var time = this.takeTime(diff);
                return getTimeBeforeString(time);
            }
            return 'Ограбление уже идет!';
        },

        getStrDate: function (date) {
            return {
                day: daysOfWeek[date.days],
                hours: addZeroToTime(date.hours),
                minutes: addZeroToTime(date.minutes)
            };
        },

        takeTime: function (minutes) {
            var days = Math.floor(minutes / (60 * 24));
            minutes -= 60 * 24 * days;
            var hours = Math.floor(minutes / 60);
            minutes -= 60 * hours;
            return {
                days: days,
                hours: hours,
                minutes: minutes
            };
        }
    };
};

function addZeroToTime(time) {
    return ((time < 10) ? '0' : '') + time;
}

function getCorrectHoursAndDay(hours, day) {
    if (hours < 0) {
        hours += 24;
        day -= 1;
    }
    if (hours >= 24) {
        hours -= 24;
        day += 1;
    }
    day = (day < 0) ? 6 : day;
    return {
        day: day,
        hours: hours
    };
}

function parseDate(date) {
    var dayName = date.slice(0, 2);
    var day = daysOfWeek.indexOf(dayName);
    if (day === -1) {
        throw new Error('Проверьте корректность дня недели');
    }
    var zone = parseInt(date.slice(8), 10);
    var hours = getUTChours(date, zone);
    var update = getCorrectHoursAndDay(hours, day);
    var minutes = parseInt(date.slice(6, 8), 10);
    return {
        day: update.day,
        hours: update.hours,
        minutes: minutes
    };
}

function getUTChours(date, zone) {
    return parseInt(date.slice(3, 5), 10) - zone;
}

function getTimeInMinutes(date) {
    return (date.day * 24 + date.hours) * 60 + date.minutes;
}

function getTimeBeforeString(time) {
    var rest = ['остался', 'осталось', 'осталось'];
    var minutes = ['минута', 'минут', 'минуты'];
    var hours = ['час', 'часов', 'часа'];
    var days = ['день', 'дней', 'дня'];
    var strTime = '';
    var restIndex = -1;
    var index = -1;
    var keys = ['days', 'hours', 'minutes'];
    var textArrays = [days, hours, minutes];
    for (var i = 0; i < keys.length; i++) {
        if (time[keys[i]] !== 0) {
            index = getCorrectIndex(time[keys[i]]);
            strTime += time[keys[i]] + ' ' + textArrays[i][index] + ' ';
            restIndex = (restIndex === -1) ? index : restIndex;
        }
    }
    if (restIndex === -1) {
        restIndex = 1;
        strTime += '0' + minutes[1];
    }
    return 'До ограбления ' + rest[restIndex] + ' ' + strTime;
}

function getCorrectIndex(time) {
    if (time !== 11 && time % 10 === 1) {
        return 0;
    }
    if ((time < 12 || time > 14) && time % 10 >= 2 && time % 10 <= 4) {
        return 2;
    }
    return 1;
}
