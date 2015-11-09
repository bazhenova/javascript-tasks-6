'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        theDate: {},

        get date() {
            return getTimeInMinutes(this.theDate);
        },

        set date(newDate) {
            this.theDate = parseDate(newDate);
        },

        // А здесь часовой пояс
        timezone: null,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var hours = this.theDate.hours + this.timezone;
            var day = this.theDate.day;
            if (hours < 0) {
                hours += 24;
                day -= 1;
            }
            if (hours >= 24) {
                hours -= 24;
                day += 1;
            }
            var newDate = {
                day: day,
                hours: hours,
                minutes: this.theDate.minutes
            };
            var strDate = getStrDate(newDate);
            pattern = pattern.replace(/%DD/g, strDate.day);
            pattern = pattern.replace(/%HH/g, strDate.hours);
            pattern = pattern.replace(/%MM/g, strDate.minutes);
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var currentTime = this.date;
            var momentTime = moment.date;
            var diff = currentTime - momentTime;
            if (diff > 0) {
                var time = takeTime(diff);
                return createStrTime(time);
            } else {
                return 'Ограбление уже идет!';
            }
        }
    };
};

function parseDate(date) {
    var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    var dayName = date.slice(0, 2);
    var day = -1;
    for (var i = 0; i < daysOfWeek.length; i++) {
        if (dayName === daysOfWeek[i]) {
            day = i;
            break;
        }
    }
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

function getStrDate(date) {
    var hours = (date.hours < 10) ? '0' + date.hours : date.hours;
    var minutes = (date.minutes < 10) ? '0' + date.minutes : date.minutes;
    var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    var day = daysOfWeek[date.day];
    return {
        day: day,
        hours: hours,
        minutes: minutes
    };
}

function getTimeInMinutes(date) {
    return (date.day * 24 + date.hours) * 60 + date.minutes;
}

function takeTime(minutes) {
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

function createStrTime(time) {
    var str = 'До ограбления ';
    var rest = ['остался', 'осталось', 'осталось'];
    var minutes = ['минута', 'минут', 'минуты'];
    var hours = ['час', 'часов', 'часа'];
    var days = ['день', 'дней', 'дня'];
    var index = getCorrectIndex(time.days);
    str += rest[index] + ' ';
    str += time.days + ' ' + days[index] + ' ';
    index = getCorrectIndex(time.hours);
    str += time.hours + ' ' + hours[index] + ' ';
    index = getCorrectIndex(time.minutes);
    str += time.minutes + ' ' + minutes[index];
    return str;
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
