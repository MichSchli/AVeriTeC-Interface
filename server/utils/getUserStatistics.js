const e = require('express');
const mongoose = require('mongoose');
const UserModel = require('../model/userModel');

const getUserStatistics = (user, date_cutoff, upper_date_cutoff) => {
    statistics = {};

    // If the cutoff date is specified, only consider annotation requests after that date
    if (date_cutoff) {
        for (let phase = 1; phase <= 5; phase++) {
            user_phase_str = "p" + phase.toString() + "_annotation_requests";
            user[user_phase_str] = user[user_phase_str].filter((request) => request.first_submission_timestamp > date_cutoff);
        }
        for (let phase = 1; phase <= 3; phase++) {
            user_phase_str = "training_p" + phase.toString() + "_annotation_requests";
            user[user_phase_str] = user[user_phase_str].filter((request) => request.first_submission_timestamp > date_cutoff);
        }
    }

    // If the upper cutoff date is specified, only consider annotation requests before that date
    if (upper_date_cutoff) {
        for (let phase = 1; phase <= 5; phase++) {
            user_phase_str = "p" + phase.toString() + "_annotation_requests";
            user[user_phase_str] = user[user_phase_str].filter((request) => request.first_submission_timestamp < upper_date_cutoff);
        }
        for (let phase = 1; phase <= 3; phase++) {
            user_phase_str = "training_p" + phase.toString() + "_annotation_requests";
            user[user_phase_str] = user[user_phase_str].filter((request) => request.first_submission_timestamp < upper_date_cutoff);
        }
    }

    // Compute completion statistics for real and training claims
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        stats_phase_str = "phase_" + phase.toString();

        completed_annotations = user[user_phase_str].filter((request) => request.annotation !== undefined)

        statistics[stats_phase_str] = {
            annotations_assigned: user[user_phase_str].length,
            annotations_done: completed_annotations.length,
            average_task_time: completed_annotations.reduce((acc, request) => acc + request.annotation.work_seconds, 0) / completed_annotations.length,
            average_load_time: completed_annotations.reduce((acc, request) => acc + (request.annotation.load_seconds ? request.annotation.load_seconds : 0), 0) / completed_annotations.length,
            annotations_per_hour: completed_annotations.length / completed_annotations.reduce((acc, request) => acc + request.annotation.work_seconds, 0) * 3600,
        };
    }
    for (let phase = 1; phase <= 3; phase++) {
        user_phase_str = "training_p" + phase.toString() + "_annotation_requests";
        stats_phase_str = "phase_" + phase.toString() + "_training";

        completed_annotations = user[user_phase_str].filter((request) => request.annotation !== undefined)

        statistics[stats_phase_str] = {
            annotations_assigned: user[user_phase_str].length,
            annotations_done: user[user_phase_str].filter((request) => request.annotation !== undefined).length,
            annotations_per_hour: completed_annotations.length / completed_annotations.reduce((acc, request) => acc + request.annotation.work_seconds, 0) * 3600,
        };
    }

    // Compute total time spent on annotation, and total time spent loading articles
    statistics.total_time_spent = 0;
    statistics.total_time_loading = 0;
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        for (let request of user[user_phase_str]) {
            if (request.annotation) {
                statistics.total_time_spent += request.annotation.work_seconds;
                statistics.total_time_loading += request.annotation.load_seconds ? request.annotation.load_seconds : 0;
            }
        }
    }

    // Compute total time spent on training annotation, and total time spent loading articles
    statistics.total_time_spent_training = 0;
    statistics.total_time_loading_training = 0;
    for (let phase = 1; phase <= 3; phase++) {
        user_phase_str = "training_p" + phase.toString() + "_annotation_requests";
        for (let request of user[user_phase_str]) {
            if (request.annotation) {
                statistics.total_time_spent_training += request.annotation.work_seconds;
                statistics.total_time_loading_training += request.annotation.load_seconds ? request.annotation.load_seconds : 0;
            }
        }
    }

    // Compute total skips:
    statistics.total_skips = 0;
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        for (let request of user[user_phase_str]) {
            if (request.annotation && request.annotation.skipped) {
                statistics.total_skips += 1;
            }
        }
    }

    // Compute total timeouts (load time >= 30 sec)
    statistics.total_timeouts = 0;
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        for (let request of user[user_phase_str]) {
            if (request.annotation && request.annotation.load_seconds >= 30) {
                statistics.total_timeouts += 1;
            }
        }
    }

    // Compute total speed traps hit (work time < 5 sec)
    statistics.total_speed_traps = 0;
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        for (let request of user[user_phase_str]) {
            if (request.annotation && request.annotation.work_seconds < 10) {
                statistics.total_speed_traps += 1;
            }
        }
    }

    // Compute average number of question per phase 2 and phase 4 annotation (given an annotation was done)
    statistics.phase_2.average_questions = 0;
    counter = 0;
    for (let request of user["p2_annotation_requests"]) {
        if (request.annotation && request.annotation.questions) {
            statistics.phase_2.average_questions += request.annotation.questions.length;
            counter += 1;
        }
    }
    if (counter > 0) {
        statistics.phase_2.average_questions /= counter;
    }

    statistics.phase_4.average_questions = 0;
    counter = 0;
    for (let request of user["p4_annotation_requests"]) {
        if (request.annotation && request.annotation.questions) {
            statistics.phase_4.average_questions += request.annotation.questions.length;
            counter += 1;
        }
    }
    if (counter > 0) {
        statistics.phase_4.average_questions /= counter;
    }

    return statistics;
}

module.exports = getUserStatistics;