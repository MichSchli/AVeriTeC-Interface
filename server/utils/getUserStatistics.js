const e = require('express');
const mongoose = require('mongoose');
const UserModel = require('../model/userModel');

const getUserStatistics = (user) => {
    statistics = {};

    // Compute completion statistics for real and training claims
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        stats_phase_str = "phase_" + phase.toString();

        completed_annotations = user[user_phase_str].filter((request) => request.annotation !== undefined)

        statistics[stats_phase_str] = {
            annotations_assigned: user[user_phase_str].length,
            annotations_done: completed_annotations.length,
            annotations_per_minute: completed_annotations.length / completed_annotations.reduce((acc, request) => acc + request.annotation.work_seconds, 0) * 60,
        };
    }
    for (let phase = 1; phase <= 3; phase++) {
        user_phase_str = "training_p" + phase.toString() + "_annotation_requests";
        stats_phase_str = "phase_" + phase.toString() + "_training";

        completed_annotations = user[user_phase_str].filter((request) => request.annotation !== undefined)

        statistics[stats_phase_str] = {
            annotations_assigned: user[user_phase_str].length,
            annotations_done: user[user_phase_str].filter((request) => request.annotation !== undefined).length,
            annotations_per_minute: completed_annotations.length / completed_annotations.reduce((acc, request) => acc + request.annotation.work_seconds, 0) * 60,
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

    // Compute total timeouts (load time > 30 sec)
    statistics.total_timeouts = 0;
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        for (let request of user[user_phase_str]) {
            if (request.annotation && request.annotation.load_seconds > 30) {
                statistics.total_timeouts += 1;
            }
        }
    }

    // Compute total speed traps hit (work time < 5 sec)
    statistics.total_speed_traps = 0;
    for (let phase = 1; phase <= 5; phase++) {
        user_phase_str = "p" + phase.toString() + "_annotation_requests";
        for (let request of user[user_phase_str]) {
            if (request.annotation && request.annotation.work_seconds < 5) {
                statistics.total_speed_traps += 1;
            }
        }
    }

    // Compute average number of question per phase 2 and phase 4 annotation (given an annotation was done)
    statistics.average_questions_p2 = 0;
    user_phase_str = "p2_annotation_requests";
    counter = 0;
    for (let request of user[user_phase_str]) {
        if (request.annotation && request.annotation.questions) {
            statistics.average_questions_p2 += request.annotation.questions.length;
            counter += 1;
        }
    }
    if (counter > 0) {
        statistics.average_questions_p2 /= counter;
    }

    statistics.average_questions_p4 = 0;
    user_phase_str = "p4_annotation_requests";
    counter = 0;
    for (let request of user[user_phase_str]) {
        if (request.annotation && request.annotation.questions) {
            statistics.average_questions_p4 += request.annotation.questions.length;
            counter += 1;
        }
    }
    if (counter > 0) {
        statistics.average_questions_p4 /= counter;
    }

    return statistics;
}

module.exports = getUserStatistics;