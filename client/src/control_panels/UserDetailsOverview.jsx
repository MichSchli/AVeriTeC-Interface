import NoteScreen from "../note_screen/NoteScreen";
import React, { useState, useEffect } from 'react';
import UserTaskPerformanceOverview from "./UserTaskPerformanceOverview";
import config from "../config.json"
import axios from "axios";

export default function UserDetailsOverview(props) {
    const [user, setUser] = useState({
        "statistics": {}
    });
    const [taskStats, setTaskStats] = useState({});

    useEffect(() => {
        var userId = new URLSearchParams(window.location.search).get("id")
        console.log("Getting data for user with ID \'" + userId + "\'.")

        // Todo: get user by id from the database, along with stats.
        // We can compute avgs and rouge here or in backend, which is easiest.
        // Todo: get this only if admin. Else, show access denied error and redirect to /.

        var request = {
            method: "get",
            baseURL: config.api_url,
            url: "/users/get/" + userId,
            data: {
            },
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        };

        axios(request).then((response) => {
            if (!localStorage.getItem('is_admin')) {
                window.alert("Error: Access denied.")
            } else {
                // Replace with:
                setUser(response.data);
            }
        }).catch((error) => { window.alert(error) })

        var request = {
            method: "get",
            baseURL: config.api_url,
            url: "/users/average_statistics",
            data: {
            },
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        };

        axios(request).then((response) => {
            if (!localStorage.getItem('is_admin')) {
                window.alert("Error: Access denied.")
            } else {
                // Replace with:
                setTaskStats(response.data);

                /*setTaskStats({
                    phase_1: {
                        annotations_done: 5.5,
                        annotations_assigned: 10,
                        claims_skipped: 2.2,
                        annotations_timed_out: 1.1,
                        speed_traps_hit: 0.2,
                        average_training_label_agreement: 0.7,
                        average_training_claim_overlap_rouge: 0.4,
                        average_training_strategy_f1: 0.5,
                        average_training_claim_type_f1: 0.9,
                        average_load_time: 3,
                        average_task_time: 4
                    },
                    phase_2: {
                        annotations_done: 4,
                        annotations_assigned: 10,
                        claims_skipped: 2.2,
                        annotations_timed_out: 1.1,
                        speed_traps_hit: 0.2,
                        average_training_label_agreement: 0.2,
                        average_training_question_overlap_rouge: 0.1,
                        average_training_answer_overlap_rouge: 1.0,
                        average_load_time: 2,
                        average_task_time: 11,
                        average_agreement_with_p3_annotators: 0.6
                    },
                    phase_3: {
                        annotations_done: 7,
                        annotations_assigned: 11,
                        claims_skipped: 2.2,
                        annotations_timed_out: 1.1,
                        speed_traps_hit: 0.2,
                        average_training_label_agreement: 0.9,
                        average_task_time: 12,
                        average_agreement_with_p2_annotators: 0.5
                    }
                })*/
            }
        }).catch((error) => { window.alert(error) })


    }, []);

    let header_text = "User Overview | " + user.username

    console.log(user)
    console.log(taskStats)

    return <NoteScreen header={header_text}>
        {user.statistics.phase_1 && taskStats.phase_1?
        <UserTaskPerformanceOverview name={"Phase 1"} userStats={user.statistics.phase_1} averageStats={taskStats.phase_1} />
        :
        ""
        }
        {user.statistics.phase_3 && taskStats.phase_3?
        <UserTaskPerformanceOverview name={"Phase 2"} userStats={user.statistics.phase_2} averageStats={taskStats.phase_2} />
        :
        ""
        }
        {user.statistics.phase_3 && taskStats.phase_3?
        <UserTaskPerformanceOverview name={"Phase 3"} userStats={user.statistics.phase_3} averageStats={taskStats.phase_3} />
        :
        ""
        }
        {user.statistics.phase_4 && taskStats.phase_4?
        <UserTaskPerformanceOverview name={"Phase 4"} userStats={user.statistics.phase_4} averageStats={taskStats.phase_4} />
        :
        ""
        }
        {user.statistics.phase_5 && taskStats.phase_5?
        <UserTaskPerformanceOverview name={"Phase 5"} userStats={user.statistics.phase_5} averageStats={taskStats.phase_5} />
        :
        ""
        }
        
    </NoteScreen>;
}