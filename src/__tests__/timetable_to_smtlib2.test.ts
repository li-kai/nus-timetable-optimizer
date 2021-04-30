import { LessonWeek, Lesson, Module, GenericTimetable } from '../core/generic_timetable'
import { TimetableSmtlib2Converter } from '../core/timetable_to_smtlib2'

test("Creates smtlib2 tables correctly", () => {
    const start_d = new Date(2018, 11, 12, 10, 30);
    const end_d = new Date(2018, 11, 12, 12, 30);
    let lesson = new Lesson("1", "Lecture", [[start_d, end_d]], ["Monday"], LessonWeek.ALL);
    let lesson2 = new Lesson("1", "Tutorial", [[start_d, end_d]], ["Tuesday"], LessonWeek.ALL);
    let mod = new Module("CS3203", 5, [lesson, lesson2], true);
    let mod2 = new Module("CS3210", 5, [lesson, lesson2], true);
    let gt = new GenericTimetable([mod, mod2], 5, 10);

    const converter = new TimetableSmtlib2Converter(gt, 100, 8, 16);
    const who_id_table = {
        CS3203__Lecture__1: 0,
        CS3203__Tutorial__1: 1024,
        CS3210__Lecture__1: 1048576,
        CS3210__Tutorial__1: 1049600
    }
    const r_who_id_table = {
        '0': 'CS3203__Lecture__1',
        '1024': 'CS3203__Tutorial__1',
        '1048576': 'CS3210__Lecture__1',
        '1049600': 'CS3210__Tutorial__1'
    }

    expect(converter.who_id_table).toEqual(who_id_table);
    expect(converter.reverse_who_id_table).toEqual(r_who_id_table);
});

test("Creates smtlib2 string correctly for one module with one tutorial clashing with lecture (made-up scenario)", () => {
    // Lecture from 1030 to 1130 
    let lesson = new Lesson("1", "Lecture", [[new Date(2018, 11, 12, 10, 30), new Date(2018, 11, 12, 11, 30)]], ["Monday"], LessonWeek.ALL);
    // Tutorial from 0930 to 1030
    let lesson2 = new Lesson("1", "Tutorial", [[new Date(2018, 11, 12, 9, 30), new Date(2018, 11, 12, 10, 30)]], ["Monday"], LessonWeek.ALL);
    // Tutorial from 1030 to 1130 (shouldn't work when we solve it)
    let lesson3 = new Lesson("2", "Tutorial", [[new Date(2018, 11, 12, 10, 30), new Date(2018, 11, 12, 11, 30)]], ["Monday"], LessonWeek.ALL);
    let mod = new Module("CS3203", 5, [lesson, lesson2, lesson3], true);
    let gt = new GenericTimetable([mod], 5, 10);

    // Timetable of only 5 hours, starting at 8 am and ending at 10 pm on a Monday (monday since we restrict # of half hour slots)
    const converter = new TimetableSmtlib2Converter(gt, 10, 8, 22);
    const smtlib2str = converter.generateSmtLib2String();
    const smtlib2str_expected = `(declare-fun SL_0 () Int)
(assert-soft (= SL_0 -1) :weight 1 :id defaultval)
(declare-fun h5 () Int)
(assert-soft (= h5 -1) :weight 1 :id defaultval)
(declare-fun h6 () Int)
(assert-soft (= h6 -1) :weight 1 :id defaultval)
(declare-fun SL_1024_1025 () Int)
(assert-soft (= SL_1024_1025 -1) :weight 1 :id defaultval)
(declare-fun h3 () Int)
(assert-soft (= h3 -1) :weight 1 :id defaultval)
(declare-fun h4 () Int)
(assert-soft (= h4 -1) :weight 1 :id defaultval)
(assert (= SL_0 0))
(assert (= (= SL_0 0) (and (= h5 0) (= h6 0))))
(assert (or (= SL_1024_1025 1024) (= SL_1024_1025 1025)))
(assert (= (= SL_1024_1025 1024) (and (= h3 1024) (= h4 1024))))
(assert (= (= SL_1024_1025 1025) (and (= h5 1025) (= h6 1025))))
(check-sat)
(get-model)
(exit)`
    expect(smtlib2str).toEqual(smtlib2str_expected)


});

