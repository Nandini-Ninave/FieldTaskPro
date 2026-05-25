"use client";

import {useContext, useEffect, useState} from "react";
import axios from "axios";
import Ct from "../../Ct";

export default function AuditPage() {
const { state, logout } =
  useContext(Ct);
  const [logs, setLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [category, setCategory] =
    useState("");

  const [actionType, setActionType] =
    useState("");

 const fetchLogs =
  async () => {

    try {

      setLoading(true);

      console.log(
        "TOKEN:",
        state.token
      );

      const res =
        await axios.get(
          "${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs",
          {
            headers: {
              Authorization:
                `Bearer ${state.token}`,
            },

            params: {
              category,
              actionType,
            },
          }
        );

      setLogs(res.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };
  useEffect(() => {

  if (state.token) {

    fetchLogs();
  }

}, [state.token]);
  return (

    <div
      style={{
        padding: "24px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >

      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "24px",
        }}
      >
        Audit Logs
      </h1>

      {/* TABLE */}

      <div
        style={{
          overflowX: "auto",
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >

          <thead>

            <tr
              style={{
                background: "#1e293b",
              }}
            >

              <th style={th}>
                Time
              </th>

              <th style={th}>
                Actor
              </th>

              <th style={th}>
                Action
              </th>

              <th style={th}>
                Category
              </th>

              <th style={th}>
                Outcome
              </th>

              <th style={th}>
                Before
              </th>

              <th style={th}>
                After
              </th>

            </tr>

          </thead>

          <tbody>

            {
              loading ? (

                <tr>
                  <td
                    colSpan="7"
                    style={td}
                  >
                    Loading...
                  </td>
                </tr>

              ) : (

                logs.map((log) => (

                  <tr
                    key={log._id}
                    style={{
                      borderBottom:
                        "1px solid #334155",
                    }}
                  >

                    <td style={td}>
                      {
                        new Date(
                          log.createdAt
                        ).toLocaleString()
                      }
                    </td>

                    <td style={td}>
                      {
                        log.actorName
                      }
                    </td>

                    <td style={td}>
                      {
                        log.actionType
                      }
                    </td>

                    <td style={td}>
                      {
                        log.category
                      }
                    </td>

                    <td style={td}>
                      {
                        log.outcome
                      }
                    </td>

                    <td style={td}>
                      {
                        JSON.stringify(
                          log.beforeValue
                        )
                      }
                    </td>

                    <td style={td}>
                      {
                        JSON.stringify(
                          log.afterValue
                        )
                      }
                    </td>

                  </tr>
                ))
              )
            }

          </tbody>

        </table>

      </div>

    </div>
  );
}

const th = {
  padding: "12px",
  textAlign: "left",
};

const td = {
  padding: "12px",
};