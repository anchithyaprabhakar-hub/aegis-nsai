import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function DownloadReport({ data }) {
  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // =========================================================
    // HELPERS
    // =========================================================

    const getFirstValue = (...values) => {
      for (const value of values) {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          return value;
        }
      }

      return null;
    };

    const toNumber = (value, fallback = 0) => {
      const number = Number(value);

      return Number.isFinite(number)
        ? number
        : fallback;
    };

    const formatNumber = (value) => {
      const number = Number(value);

      if (!Number.isFinite(number)) {
        return "Not available";
      }

      return number.toLocaleString();
    };

    // =========================================================
    // ANALYSIS DATA
    // =========================================================

    const prediction =
      getFirstValue(
        data.prediction,
        data.final_prediction,
        data.finalPrediction,
        data.attack_type,
        data.attackType
      ) || "Unknown";

    const mlPrediction =
      getFirstValue(
        data.ml_prediction,
        data.mlPrediction,
        data.ml_result,
        data.mlResult,
        data.ml_label,
        data.mlLabel
      ) || prediction;

    const confidence = toNumber(
      getFirstValue(
        data.confidence,
        data.ml_confidence,
        data.mlConfidence
      )
    );

    let symbolicEvidence = toNumber(
      getFirstValue(
        data.symbolic_confidence,
        data.symbolic_evidence,
        data.symbolic_support,
        data.symbolicConfidence,
        data.symbolicEvidence,
        data.symbolicSupport,
        data.rule_confidence,
        data.rule_support,
        data.ruleSupport
      )
    );

    // Extract symbolic evidence from backend message if needed.
    if (!symbolicEvidence && data.message) {
      const match = String(data.message).match(
        /symbolic\s+(?:evidence|support).*?(\d+(?:\.\d+)?)%/i
      );

      if (match) {
        symbolicEvidence = Number(match[1]);
      }
    }

    const knowledgeGraph =
      Array.isArray(data.knowledge_graph)
        ? data.knowledge_graph
        : Array.isArray(data.knowledgeGraph)
        ? data.knowledgeGraph
        : Array.isArray(data.knowledge_graph_context)
        ? data.knowledge_graph_context
        : [];

    // =========================================================
    // FILE INFORMATION
    // =========================================================

    const fileName =
      getFirstValue(
        data.filename,
        data.file_name,
        data.fileName,
        data.uploaded_file,
        data.uploadedFile,
        data.uploaded_filename,
        data.uploadedFilename,
        data.source_file,
        data.sourceFile,
        data.dataset_name,
        data.datasetName,
        data.original_filename,
        data.originalFilename,
        data.file?.name,
        data.file?.filename,
        data.upload?.filename,
        data.upload?.file_name,
        data.analysis?.filename,
        data.analysis?.file_name,
        data.metadata?.filename,
        data.metadata?.file_name
      ) || "Uploaded network dataset";

    const recordCountValue =
      getFirstValue(
        data.rows_analyzed,
        data.rowsAnalyzed,
        data.total_rows,
        data.totalRows,
        data.records_analyzed,
        data.recordsAnalyzed,
        data.samples_analyzed,
        data.samplesAnalyzed,
        data.row_count,
        data.rowCount,
        data.records,
        data.total_records,
        data.totalRecords,
        data.analyzed_rows,
        data.analyzedRows,
        data.analysis?.rows_analyzed,
        data.analysis?.rowsAnalyzed,
        data.analysis?.total_rows,
        data.analysis?.totalRows,
        data.analysis?.records_analyzed,
        data.analysis?.recordsAnalyzed,
        data.metadata?.rows_analyzed,
        data.metadata?.rowsAnalyzed
      );

    const recordCount =
      recordCountValue !== null
        ? formatNumber(recordCountValue)
        : "Not available";

    // =========================================================
    // DATASET DOMINANCE
    // =========================================================

    const mlDominant =
      getFirstValue(
        data.ml_dominant_prediction,
        data.mlDominantPrediction,
        data.dominant_prediction,
        data.dominantPrediction,
        data.ml_majority_prediction,
        data.mlMajorityPrediction,
        data.dominant_label,
        data.dominantLabel
      ) || mlPrediction;

    const mlDominantCoverage = toNumber(
      getFirstValue(
        data.ml_dominant_percentage,
        data.mlDominantPercentage,
        data.dominant_percentage,
        data.dominantPercentage,
        data.ml_dominant_coverage,
        data.mlDominantCoverage,
        data.dominant_coverage,
        data.dominantCoverage
      )
    );

    // =========================================================
    // THREAT ASSESSMENT
    // =========================================================

    const isNormal =
      String(prediction).toLowerCase() === "normal" ||
      String(prediction).toLowerCase() === "benign";

    let threat = "LOW";

    if (confidence >= 80 && !isNormal) {
      threat = "CRITICAL";
    } else if (confidence >= 60 && !isNormal) {
      threat = "HIGH";
    } else if (confidence >= 30 && !isNormal) {
      threat = "MEDIUM";
    }

    const riskScore = isNormal
      ? Math.max(
          0,
          Math.round(100 - confidence)
        )
      : Math.round(confidence);

    // =========================================================
    // REPORT METADATA
    // =========================================================

    const reportId = `AEG-${Date.now()}`;

    const generatedAt =
      new Date().toLocaleString();

    // =========================================================
    // INDEPENDENT MODEL VALIDATION
    // =========================================================

    const validationMetrics = {
      accuracy: 97.89,
      macroPrecision: 65.19,
      macroRecall: 87.08,
      macroF1: 68.93,
      weightedPrecision: 98.71,
      weightedRecall: 97.89,
      weightedF1: 98.23,
      testSamples: 424182,
      averageConfidence: 98.12,
    };

    // =========================================================
    // COLORS
    // =========================================================

    const COLORS = {
      green: [34, 197, 94],
      darkGreen: [21, 128, 61],
      red: [220, 38, 38],
      orange: [234, 88, 12],
      yellow: [202, 138, 4],
      blue: [37, 99, 235],
      cyan: [14, 116, 144],
      dark: [20, 20, 20],
      gray: [107, 114, 128],
      lightGray: [243, 244, 246],
      lighterGray: [248, 250, 252],
      border: [220, 220, 220],
      white: [255, 255, 255],
    };

    const threatColor =
      threat === "CRITICAL"
        ? COLORS.red
        : threat === "HIGH"
        ? COLORS.orange
        : threat === "MEDIUM"
        ? COLORS.yellow
        : COLORS.green;

    // =========================================================
    // PDF HELPERS
    // =========================================================

    const setText = (
      size = 10,
      style = "normal",
      color = COLORS.dark
    ) => {
      doc.setFont(
        "helvetica",
        style
      );

      doc.setFontSize(size);

      doc.setTextColor(
        ...color
      );
    };

    const roundedBox = (
      x,
      y,
      width,
      height,
      fill,
      radius = 4
    ) => {
      doc.setFillColor(
        ...fill
      );

      doc.roundedRect(
        x,
        y,
        width,
        height,
        radius,
        radius,
        "F"
      );
    };

    const outlineBox = (
      x,
      y,
      width,
      height
    ) => {
      doc.setDrawColor(
        ...COLORS.border
      );

      doc.setLineWidth(
        0.4
      );

      doc.roundedRect(
        x,
        y,
        width,
        height,
        3,
        3,
        "S"
      );
    };

    const wrappedText = (
      text,
      x,
      y,
      width,
      lineHeight = 4
    ) => {
      const lines =
        doc.splitTextToSize(
          String(text),
          width
        );

      doc.text(
        lines,
        x,
        y
      );

      return (
        y +
        lines.length *
          lineHeight
      );
    };

    const drawHeader = (
      title,
      subtitle = ""
    ) => {
      doc.setFillColor(
        ...COLORS.dark
      );

      doc.rect(
        0,
        0,
        210,
        18,
        "F"
      );

      setText(
        16,
        "bold",
        COLORS.white
      );

      doc.text(
        "AEGIS-NSAI",
        14,
        11
      );

      setText(
        8,
        "normal",
        [210, 210, 210]
      );

      doc.text(
        "Neuro-Symbolic Intrusion Detection System",
        196,
        11,
        {
          align: "right",
        }
      );

      setText(
        17,
        "bold",
        COLORS.dark
      );

      doc.text(
        title,
        14,
        31
      );

      if (subtitle) {
        setText(
          9,
          "normal",
          COLORS.gray
        );

        doc.text(
          subtitle,
          14,
          37
        );
      }
    };

    const drawFooter = (
      pageNumber
    ) => {
      doc.setDrawColor(
        ...COLORS.border
      );

      doc.setLineWidth(
        0.4
      );

      doc.line(
        14,
        280,
        196,
        280
      );

      setText(
        7.2,
        "normal",
        COLORS.gray
      );

      doc.text(
        "AEGIS-NSAI • Neuro-Symbolic Intrusion Detection System",
        14,
        286
      );

      doc.text(
        `Report ${reportId}`,
        105,
        286,
        {
          align: "center",
        }
      );

      doc.text(
        `Page ${pageNumber} of 4`,
        196,
        286,
        {
          align: "right",
        }
      );
    };

    const drawProgressBar = (
      x,
      y,
      width,
      percentage,
      color
    ) => {
      const value =
        Math.max(
          0,
          Math.min(
            100,
            Number(
              percentage
            ) || 0
          )
        );

      doc.setFillColor(
        ...COLORS.lightGray
      );

      doc.roundedRect(
        x,
        y,
        width,
        5,
        2,
        2,
        "F"
      );

      if (value > 0) {
        doc.setFillColor(
          ...color
        );

        doc.roundedRect(
          x,
          y,
          (width *
            value) /
            100,
          5,
          2,
          2,
          "F"
        );
      }
    };

    // =========================================================
    // RECOMMENDATIONS
    // =========================================================

    const getRecommendations =
      () => {
        const attack =
          String(
            prediction
          ).toLowerCase();

        if (isNormal) {
          return [
            "Continue monitoring the traffic source and maintain normal network logging.",
            "Correlate future anomalies with firewall, endpoint and authentication logs.",
            "Re-analyse new traffic captures if abnormal behaviour is observed.",
          ];
        }

        if (
          attack.includes(
            "portscan"
          ) ||
          attack.includes(
            "port scan"
          )
        ) {
          return [
            "Investigate originating source addresses associated with the scanning activity.",
            "Review repeated connection attempts across destination ports.",
            "Check whether reconnaissance is followed by exploitation attempts.",
            "Apply rate limiting or temporary blocking where operationally appropriate.",
            "Correlate the event with firewall and endpoint security logs.",
          ];
        }

        if (
          attack.includes(
            "ddos"
          )
        ) {
          return [
            "Investigate the distribution and concentration of traffic sources.",
            "Review firewall and edge-device telemetry for correlated traffic spikes.",
            "Apply rate limiting or traffic filtering where operationally appropriate.",
            "Check service availability and resource utilisation during the event.",
            "Correlate the detection with upstream network and application logs.",
          ];
        }

        if (
          attack.includes(
            "dos"
          )
        ) {
          return [
            "Investigate the affected service and destination endpoints.",
            "Review abnormal packet and byte-rate behaviour.",
            "Inspect firewall and service logs for repeated requests.",
            "Apply rate limiting or filtering where operationally appropriate.",
            "Monitor the affected service for continued degradation.",
          ];
        }

        if (
          attack.includes(
            "brute"
          ) ||
          attack.includes(
            "patator"
          )
        ) {
          return [
            "Identify the targeted authentication or service endpoint.",
            "Review repeated connection and authentication attempts.",
            "Inspect account logs for suspicious login activity.",
            "Apply rate limiting and account protection controls.",
            "Correlate the event with authentication and endpoint telemetry.",
          ];
        }

        if (
          attack.includes(
            "web"
          )
        ) {
          return [
            "Inspect requests targeting the affected web service.",
            "Review web-server and application logs for malicious patterns.",
            "Check for repeated requests originating from the same sources.",
            "Apply appropriate WAF or request-filtering controls.",
            "Correlate the event with application and endpoint security logs.",
          ];
        }

        return [
          "Investigate originating traffic sources and affected endpoints.",
          "Review firewall and network telemetry for correlated events.",
          "Inspect relevant service or application logs.",
          "Apply containment controls where operationally appropriate.",
          "Continue monitoring for repeated or escalating activity.",
        ];
      };

    // =========================================================
    // PAGE 1 — EXECUTIVE SUMMARY
    // =========================================================

    drawHeader(
      "Security Analysis Report",
      "Executive assessment of the analysed network traffic"
    );

    roundedBox(
      14,
      47,
      182,
      48,
      threatColor
    );

    setText(
      9,
      "bold",
      COLORS.white
    );

    doc.text(
      isNormal
        ? "NO MALICIOUS ACTIVITY DETECTED"
        : "THREAT DETECTED",
      22,
      58
    );

    setText(
      23,
      "bold",
      COLORS.white
    );

    doc.text(
      String(
        prediction
      ).toUpperCase(),
      22,
      72
    );

    setText(
      9,
      "normal",
      COLORS.white
    );

    doc.text(
      `Detection confidence: ${confidence.toFixed(
        2
      )}%`,
      22,
      82
    );

    doc.text(
      `Severity: ${threat}`,
      22,
      89
    );

    // Risk score
    doc.setDrawColor(
      ...COLORS.white
    );

    doc.setLineWidth(
      0.5
    );

    doc.roundedRect(
      132,
      53,
      56,
      37,
      3,
      3,
      "S"
    );

    setText(
      8,
      "bold",
      COLORS.white
    );

    doc.text(
      "RISK SCORE",
      160,
      61,
      {
        align: "center",
      }
    );

    setText(
      22,
      "bold",
      COLORS.white
    );

    doc.text(
      `${riskScore}/100`,
      160,
      75,
      {
        align: "center",
      }
    );

    setText(
      7.5,
      "normal",
      COLORS.white
    );

    doc.text(
      isNormal
        ? "LOWER = SAFER"
        : "HIGHER = RISKIER",
      160,
      84,
      {
        align: "center",
      }
    );

    // Analysis overview
    setText(
      13,
      "bold"
    );

    doc.text(
      "Analysis Overview",
      14,
      108
    );

    autoTable(
      doc,
      {
        startY: 114,
        margin: {
          left: 14,
          right: 14,
        },
        theme: "grid",
        head: [
          [
            "Analysis Property",
            "Result",
          ],
        ],
        body: [
          [
            "Input File",
            fileName,
          ],
          [
            "Records Analysed",
            recordCount,
          ],
          [
            "Detection Architecture",
            "Neuro-Symbolic AI",
          ],
          [
            "Final Decision",
            prediction,
          ],
          [
            "Threat Level",
            threat,
          ],
          [
            "Risk Score",
            `${riskScore}/100`,
          ],
          [
            "Report ID",
            reportId,
          ],
          [
            "Generated",
            generatedAt,
          ],
        ],
        headStyles: {
          fillColor:
            COLORS.dark,
          textColor:
            COLORS.white,
          fontStyle:
            "bold",
        },
        bodyStyles: {
          textColor: [
            45,
            45,
            45,
          ],
          fontSize: 8.1,
        },
        alternateRowStyles: {
          fillColor: [
            248,
            248,
            248,
          ],
        },
        columnStyles: {
          0: {
            cellWidth: 65,
            fontStyle:
              "bold",
          },
          1: {
            cellWidth: 117,
          },
        },
      }
    );

    let y =
      doc.lastAutoTable
        .finalY + 9;

    setText(
      13,
      "bold"
    );

    doc.text(
      "AEGIS-NSAI Detection Architecture",
      14,
      y
    );

    y += 7;

    outlineBox(
      14,
      y,
      182,
      45
    );

    setText(
      10,
      "bold",
      COLORS.blue
    );

    doc.text(
      "1. Neural Detection",
      22,
      y + 11
    );

    setText(
      8.5,
      "normal",
      COLORS.dark
    );

    doc.text(
      "Learns traffic patterns from network-flow features.",
      22,
      y + 17
    );

    setText(
      10,
      "bold",
      COLORS.cyan
    );

    doc.text(
      "2. Symbolic Reasoning",
      22,
      y + 29
    );

    setText(
      8.5,
      "normal",
      COLORS.dark
    );

    doc.text(
      "Applies interpretable behavioural rules.",
      22,
      y + 35
    );

    setText(
      10,
      "bold",
      COLORS.darkGreen
    );

    doc.text(
      "3. Fusion + Threat Context",
      112,
      y + 11
    );

    setText(
      8.5,
      "normal",
      COLORS.dark
    );

    doc.text(
      "Combines model output with rule evidence",
      112,
      y + 17
    );

    doc.text(
      "and knowledge-driven security context.",
      112,
      y + 23
    );

    drawFooter(1);

    // =========================================================
    // PAGE 2 — NEURO-SYMBOLIC EVIDENCE
    // =========================================================

    doc.addPage();

    drawHeader(
      "Neuro-Symbolic Detection Evidence",
      "How AEGIS-NSAI reached the final classification"
    );

    setText(
      13,
      "bold"
    );

    doc.text(
      "Decision Pipeline",
      14,
      50
    );

    // Neural model
    roundedBox(
      14,
      58,
      78,
      39,
      [
        239,
        246,
        255,
      ]
    );

    setText(
      8,
      "bold",
      COLORS.blue
    );

    doc.text(
      "NEURAL MODEL",
      53,
      68,
      {
        align: "center",
      }
    );

    setText(
      13,
      "bold",
      COLORS.blue
    );

    doc.text(
      String(
        mlPrediction
      ),
      53,
      80,
      {
        align: "center",
      }
    );

    setText(
      8,
      "normal",
      COLORS.gray
    );

    doc.text(
      `${confidence.toFixed(
        2
      )}% confidence`,
      53,
      89,
      {
        align: "center",
      }
    );

    // Symbolic engine
    roundedBox(
      118,
      58,
      78,
      39,
      [
        240,
        253,
        250,
      ]
    );

    setText(
      8,
      "bold",
      COLORS.cyan
    );

    doc.text(
      "SYMBOLIC ENGINE",
      157,
      68,
      {
        align: "center",
      }
    );

    setText(
      10.5,
      "bold",
      COLORS.cyan
    );

    doc.text(
      isNormal
        ? "No dominant malicious evidence"
        : `${prediction} evidence`,
      157,
      80,
      {
        align: "center",
      }
    );

    setText(
      8,
      "normal",
      COLORS.gray
    );

    doc.text(
      `${symbolicEvidence.toFixed(
        2
      )}% rule support`,
      157,
      89,
      {
        align: "center",
      }
    );

    setText(
      16,
      "bold",
      COLORS.gray
    );

    doc.text(
      "+",
      105,
      78,
      {
        align: "center",
      }
    );

    // Fusion
    roundedBox(
      53,
      104,
      104,
      30,
      COLORS.dark
    );

    setText(
      8,
      "bold",
      COLORS.white
    );

    doc.text(
      "NEURO-SYMBOLIC FUSION",
      105,
      114,
      {
        align: "center",
      }
    );

    setText(
      12,
      "bold",
      COLORS.white
    );

    doc.text(
      `FINAL: ${String(
        prediction
      ).toUpperCase()}`,
      105,
      126,
      {
        align: "center",
      }
    );

    setText(
      14,
      "bold",
      COLORS.gray
    );

    doc.text(
      "↓",
      105,
      143,
      {
        align: "center",
      }
    );

    // Neural analysis
    setText(
      13,
      "bold"
    );

    doc.text(
      "Neural Model Analysis",
      14,
      157
    );

    outlineBox(
      14,
      163,
      182,
      43
    );

    setText(
      8,
      "bold",
      COLORS.gray
    );

    doc.text(
      "MODEL PREDICTION",
      22,
      174
    );

    setText(
      15,
      "bold",
      COLORS.blue
    );

    doc.text(
      String(
        mlPrediction
      ),
      22,
      187
    );

    setText(
      8.5,
      "normal",
      COLORS.gray
    );

    doc.text(
      `Neural confidence: ${confidence.toFixed(
        2
      )}%`,
      22,
      197
    );

    drawProgressBar(
      95,
      194,
      82,
      confidence,
      COLORS.blue
    );

    // Dataset dominance
    setText(
      8,
      "bold",
      COLORS.gray
    );

    doc.text(
      "DATASET-LEVEL DOMINANCE",
      108,
      174
    );

    setText(
      11,
      "bold",
      COLORS.dark
    );

    doc.text(
      String(
        mlDominant
      ),
      108,
      185
    );

    setText(
      8,
      "normal",
      COLORS.gray
    );

    doc.text(
      mlDominantCoverage >
        0
        ? `${mlDominantCoverage.toFixed(
            2
          )}% of analysed records`
        : "Dataset-level result",
      108,
      196
    );

    // Symbolic reasoning
    setText(
      13,
      "bold"
    );

    doc.text(
      "Symbolic Reasoning Analysis",
      14,
      220
    );

    outlineBox(
      14,
      226,
      182,
      39
    );

    setText(
      8,
      "bold",
      COLORS.gray
    );

    doc.text(
      "RULE-BASED EVIDENCE",
      22,
      237
    );

    setText(
      12,
      "bold",
      COLORS.cyan
    );

    doc.text(
      isNormal
        ? "No dominant malicious evidence"
        : `${prediction} supporting evidence`,
      22,
      248
    );

    setText(
      8.5,
      "normal",
      COLORS.gray
    );

    doc.text(
      `Evidence score: ${symbolicEvidence.toFixed(
        2
      )}%`,
      22,
      258
    );

    if (
      knowledgeGraph.length >
      0
    ) {
      setText(
        8,
        "bold",
        COLORS.gray
      );

      doc.text(
        "BEHAVIOURAL INDICATORS",
        118,
        237
      );

      knowledgeGraph
        .slice(0, 3)
        .forEach(
          (
            item,
            index
          ) => {
            const itemY =
              246 +
              index * 6;

            doc.setFillColor(
              ...COLORS.cyan
            );

            doc.circle(
              121,
              itemY - 1.5,
              1,
              "F"
            );

            setText(
              7.3,
              "normal",
              COLORS.dark
            );

            doc.text(
              String(item),
              126,
              itemY
            );
          }
        );
    }

    setText(
      8,
      "bold",
      COLORS.gray
    );

    doc.text(
      "INTERPRETATION",
      14,
      274
    );

    setText(
      7.2,
      "normal",
      COLORS.gray
    );

    doc.text(
      `ML confidence = ${confidence.toFixed(
        2
      )}% | Symbolic evidence = ${symbolicEvidence.toFixed(
        2
      )}% | Dataset dominance = ${
        mlDominantCoverage >
        0
          ? mlDominantCoverage.toFixed(
              2
            )
          : "N/A"
      }%`,
      45,
      274
    );

    drawFooter(2);

    // =========================================================
    // PAGE 3 — THREAT INTELLIGENCE & RESPONSE
    // =========================================================

    doc.addPage();

    drawHeader(
      "Threat Intelligence & Response",
      "Security interpretation and recommended analyst actions"
    );

    // ---------------------------------------------------------
    // KNOWLEDGE GRAPH
    // ---------------------------------------------------------

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Knowledge Graph Context",
      14,
      49
    );

    if (
      knowledgeGraph.length >
      0
    ) {
      const centerX = 105;

      roundedBox(
        73,
        56,
        64,
        20,
        COLORS.dark
      );

      setText(
        10,
        "bold",
        COLORS.white
      );

      doc.text(
        String(
          prediction
        ),
        centerX,
        68,
        {
          align: "center",
        }
      );

      const positions = [
        {
          x: 18,
          y: 84,
        },
        {
          x: 77,
          y: 84,
        },
        {
          x: 136,
          y: 84,
        },
      ];

      knowledgeGraph
        .slice(0, 3)
        .forEach(
          (
            item,
            index
          ) => {
            const position =
              positions[index];

            doc.setDrawColor(
              ...COLORS.gray
            );

            doc.setLineWidth(
              0.5
            );

            doc.line(
              centerX,
              76,
              position.x +
                28,
              position.y
            );

            roundedBox(
              position.x,
              position.y,
              56,
              17,
              [
                245,
                247,
                250,
              ]
            );

            setText(
              7.2,
              "bold",
              COLORS.dark
            );

            const itemLines =
              doc.splitTextToSize(
                String(
                  item
                ),
                48
              );

            doc.text(
              itemLines,
              position.x +
                28,
              position.y +
                8,
              {
                align:
                  "center",
              }
            );
          }
        );
    } else {
      outlineBox(
        14,
        56,
        182,
        30
      );

      setText(
        8.5,
        "normal",
        COLORS.gray
      );

      doc.text(
        "No knowledge-graph indicators were returned.",
        105,
        74,
        {
          align:
            "center",
        }
      );
    }

    // ---------------------------------------------------------
    // SECURITY INTERPRETATION
    // ---------------------------------------------------------

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Security Interpretation",
      14,
      111
    );

    outlineBox(
      14,
      117,
      182,
      31
    );

    const attack =
      String(
        prediction
      ).toLowerCase();

    let interpretation;

    if (isNormal) {
      interpretation =
        "The analysed traffic was classified as normal. No malicious final classification was produced by the AEGIS-NSAI detection pipeline. Continued monitoring and correlation with other security telemetry is recommended.";
    } else if (
      attack.includes(
        "port"
      )
    ) {
      interpretation =
        "The analysed traffic exhibits characteristics associated with network reconnaissance and systematic probing of accessible services. This activity may indicate attempts to discover open ports and identify potentially exploitable network services.";
    } else if (
      attack.includes(
        "ddos"
      )
    ) {
      interpretation =
        "The analysed traffic was classified as distributed denial-of-service activity. The detected pattern may affect service availability and should be correlated with network and application telemetry.";
    } else if (
      attack.includes(
        "dos"
      )
    ) {
      interpretation =
        "The analysed traffic was classified as denial-of-service activity. The event should be correlated with service logs, packet-rate behaviour and resource utilisation.";
    } else if (
      attack.includes(
        "web"
      )
    ) {
      interpretation =
        "The analysed traffic was classified as a web attack pattern. The event should be correlated with web-server and application logs to determine the targeted resource and potential exploitation attempts.";
    } else {
      interpretation =
        `The analysed traffic was classified as ${prediction}. The result should be correlated with network, endpoint and application telemetry to determine the source, target and operational impact of the detected activity.`;
    }

    setText(
      7.7,
      "normal",
      COLORS.dark
    );

    wrappedText(
      interpretation,
      22,
      127,
      166,
      3.7
    );

    // ---------------------------------------------------------
    // EVIDENCE SUMMARY
    // ---------------------------------------------------------

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Detection Evidence Summary",
      14,
      156
    );

    autoTable(
      doc,
      {
        startY: 162,
        margin: {
          left: 14,
          right: 14,
        },
        theme: "grid",
        head: [
          [
            "Component",
            "Finding",
            "Result",
          ],
        ],
        body: [
          [
            "Neural Detector",
            String(
              mlPrediction
            ),
            `${confidence.toFixed(
              2
            )}%`,
          ],
          [
            "Symbolic Engine",
            isNormal
              ? "No dominant malicious evidence"
              : `${prediction} supporting evidence`,
            `${symbolicEvidence.toFixed(
              2
            )}%`,
          ],
          [
            "Knowledge Graph",
            knowledgeGraph.length
              ? knowledgeGraph.join(
                  ", "
                )
              : "No indicators",
            knowledgeGraph.length
              ? "Linked"
              : "N/A",
          ],
          [
            "Fusion Layer",
            String(
              prediction
            ),
            "FINAL",
          ],
          [
            "Threat Assessment",
            threat,
            `${riskScore}/100`,
          ],
        ],
        headStyles: {
          fillColor:
            COLORS.dark,
          textColor:
            COLORS.white,
          fontStyle:
            "bold",
          fontSize: 7.5,
        },
        bodyStyles: {
          fontSize: 7,
          textColor:
            COLORS.dark,
          cellPadding: 1.4,
        },
        alternateRowStyles: {
          fillColor: [
            248,
            248,
            248,
          ],
        },
        columnStyles: {
          0: {
            cellWidth: 42,
            fontStyle:
              "bold",
          },
          1: {
            cellWidth: 105,
          },
          2: {
            cellWidth: 35,
            halign:
              "center",
          },
        },
      }
    );

    // ---------------------------------------------------------
    // WHY THIS CLASSIFICATION MATTERS
    // ---------------------------------------------------------

    const whyTitleY =
      doc.lastAutoTable
        .finalY + 6;

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Why This Classification Matters",
      14,
      whyTitleY
    );

    const whyBoxY =
      whyTitleY + 5;

    outlineBox(
      14,
      whyBoxY,
      182,
      28
    );

    let whyText;

    if (
      attack.includes(
        "port"
      )
    ) {
      whyText =
        "Port scanning is commonly associated with reconnaissance activity in which an actor probes network services to identify reachable ports and potential attack surfaces. Detection should therefore be correlated with source addresses, destination-port patterns and subsequent exploitation attempts.";
    } else if (
      attack.includes(
        "ddos"
      )
    ) {
      whyText =
        "Distributed denial-of-service activity can affect service availability through coordinated traffic. Investigation should consider traffic sources, affected services, resource utilisation and upstream network telemetry.";
    } else if (
      attack.includes(
        "dos"
      )
    ) {
      whyText =
        "Denial-of-service activity may affect service availability through abnormal traffic behaviour. Investigation should correlate the detection with service logs, resource utilisation and network telemetry.";
    } else if (
      attack.includes(
        "web"
      )
    ) {
      whyText =
        "Web attack activity may target application endpoints through suspicious request patterns. Correlation with web-server, application and authentication logs is required to determine whether exploitation occurred.";
    } else if (isNormal) {
      whyText =
        "The normal classification indicates that the analysed traffic did not receive a malicious final classification. Continued monitoring remains important because benign traffic can coexist with malicious activity in a broader environment.";
    } else {
      whyText =
        `The ${prediction} classification represents a security-relevant traffic pattern that should be correlated with additional network and endpoint telemetry before operational response.`;
    }

    setText(
      7.4,
      "normal",
      COLORS.dark
    );

    wrappedText(
      whyText,
      22,
      whyBoxY + 8,
      166,
      3.6
    );

    // ---------------------------------------------------------
    // RECOMMENDED ANALYST ACTIONS
    // ---------------------------------------------------------

    const recommendationTitleY =
      whyBoxY + 35;

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Recommended Analyst Actions",
      14,
      recommendationTitleY
    );

    const recommendations =
      getRecommendations();

    const actionBoxY =
      recommendationTitleY + 5;

    const actionBoxHeight = 29;

    roundedBox(
      14,
      actionBoxY,
      182,
      actionBoxHeight,
      COLORS.lighterGray,
      3
    );

    const leftActions =
      recommendations.slice(
        0,
        3
      );

    const rightActions =
      recommendations.slice(
        3,
        5
      );

    // IMPORTANT:
    // Right column numbering starts from 4, not 1.
    const drawActionColumn =
      (
        actions,
        x,
        width,
        startingIndex
      ) => {
        let currentY =
          actionBoxY + 5;

        actions.forEach(
          (
            recommendation,
            index
          ) => {
            const globalIndex =
              startingIndex +
              index;

            setText(
              6.8,
              "bold",
              threatColor
            );

            doc.text(
              `${globalIndex + 1}.`,
              x,
              currentY
            );

            setText(
              6.5,
              "normal",
              COLORS.dark
            );

            const lines =
              doc.splitTextToSize(
                recommendation,
                width - 8
              );

            doc.text(
              lines,
              x + 7,
              currentY
            );

            currentY +=
              Math.max(
                5,
                lines.length *
                  2.7
              ) + 1;
          }
        );
      };

    drawActionColumn(
      leftActions,
      19,
      80,
      0
    );

    drawActionColumn(
      rightActions,
      108,
      80,
      3
    );

    setText(
      6.7,
      "normal",
      COLORS.gray
    );

    doc.text(
      "Scope: dataset-level classification of the uploaded network-flow CSV.",
      14,
      273
    );

    drawFooter(3);

    // =========================================================
    // PAGE 4 — MODEL VALIDATION & RESEARCH CONTEXT
    // =========================================================

    doc.addPage();

    drawHeader(
      "Model Validation & Research Context",
      "Independent evaluation of the underlying intrusion detection model"
    );

    // ---------------------------------------------------------
    // HELD-OUT TEST EVALUATION
    // ---------------------------------------------------------

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Held-Out Test Evaluation",
      14,
      49
    );

    setText(
      7.8,
      "normal",
      COLORS.gray
    );

    doc.text(
      "The saved AEGIS-NSAI model was evaluated independently on a stratified held-out test set.",
      14,
      56
    );

    autoTable(
      doc,
      {
        startY: 62,
        margin: {
          left: 14,
          right: 14,
        },
        theme: "grid",
        head: [
          [
            "Evaluation Metric",
            "Result",
          ],
        ],
        body: [
          [
            "Accuracy",
            `${validationMetrics.accuracy}%`,
          ],
          [
            "Macro Precision",
            `${validationMetrics.macroPrecision}%`,
          ],
          [
            "Macro Recall",
            `${validationMetrics.macroRecall}%`,
          ],
          [
            "Macro F1",
            `${validationMetrics.macroF1}%`,
          ],
          [
            "Weighted Precision",
            `${validationMetrics.weightedPrecision}%`,
          ],
          [
            "Weighted Recall",
            `${validationMetrics.weightedRecall}%`,
          ],
          [
            "Weighted F1",
            `${validationMetrics.weightedF1}%`,
          ],
          [
            "Average Confidence",
            `${validationMetrics.averageConfidence}%`,
          ],
          [
            "Held-Out Test Samples",
            validationMetrics.testSamples.toLocaleString(),
          ],
        ],
        headStyles: {
          fillColor:
            COLORS.dark,
          textColor:
            COLORS.white,
          fontStyle:
            "bold",
          fontSize: 7.7,
        },
        bodyStyles: {
          fontSize: 7.2,
          textColor:
            COLORS.dark,
          cellPadding: 1.2,
        },
        alternateRowStyles: {
          fillColor: [
            248,
            248,
            248,
          ],
        },
        columnStyles: {
          0: {
            cellWidth: 105,
            fontStyle:
              "bold",
          },
          1: {
            cellWidth: 77,
            halign:
              "center",
          },
        },
      }
    );

    // ---------------------------------------------------------
    // DETECTION SYSTEM PROFILE
    // ---------------------------------------------------------

    let profileY =
      doc.lastAutoTable
        .finalY + 7;

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Detection System Profile",
      14,
      profileY
    );

    profileY += 5;

    autoTable(
      doc,
      {
        startY: profileY,
        margin: {
          left: 14,
          right: 14,
        },
        theme: "grid",
        head: [
          [
            "Property",
            "Configuration",
          ],
        ],
        body: [
          [
            "System",
            "AEGIS-NSAI",
          ],
          [
            "Architecture",
            "Neuro-Symbolic AI",
          ],
          [
            "ML Framework",
            "PyTorch",
          ],
          [
            "Input Features",
            "78",
          ],
          [
            "Attack Classes",
            "15",
          ],
          [
            "Reasoning Layer",
            "Rule-based symbolic engine",
          ],
          [
            "Knowledge Layer",
            "Security knowledge graph",
          ],
          [
            "Decision Layer",
            "ML + symbolic fusion",
          ],
        ],
        headStyles: {
          fillColor:
            COLORS.blue,
          textColor:
            COLORS.white,
          fontStyle:
            "bold",
          fontSize: 7.7,
        },
        bodyStyles: {
          fontSize: 7.1,
          textColor:
            COLORS.dark,
          cellPadding: 1.15,
        },
        alternateRowStyles: {
          fillColor: [
            248,
            248,
            248,
          ],
        },
        columnStyles: {
          0: {
            cellWidth: 65,
            fontStyle:
              "bold",
          },
          1: {
            cellWidth: 117,
          },
        },
      }
    );

    // ---------------------------------------------------------
    // RESEARCH INTERPRETATION
    // ---------------------------------------------------------

    let researchY =
      doc.lastAutoTable
        .finalY + 7;

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Research Interpretation",
      14,
      researchY
    );

    const researchBoxY =
      researchY + 5;

    outlineBox(
      14,
      researchBoxY,
      182,
      27
    );

    const researchText =
      "The underlying model demonstrates strong aggregate detection performance, achieving 97.89% accuracy and 98.23% weighted F1-score on the held-out test set. The lower macro F1 of 68.93% indicates that performance is not uniform across all attack classes, particularly where rare classes have limited representation.";

    setText(
      7.3,
      "normal",
      COLORS.dark
    );

    wrappedText(
      researchText,
      22,
      researchBoxY + 8,
      166,
      3.6
    );

    // ---------------------------------------------------------
    // MODEL & ANALYSIS LIMITATIONS
    // ---------------------------------------------------------

    const limitationTitleY =
      researchBoxY + 34;

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Model & Analysis Limitations",
      14,
      limitationTitleY
    );

    const limitations = [
      "Performance is affected by class imbalance within the CIC-IDS2017 evaluation data.",
      "Rare attack classes have substantially lower support and can reduce macro-level performance.",
      "Some classes contain very small test samples, limiting the strength of class-specific conclusions.",
      "Symbolic rule scores represent interpretable behavioural evidence rather than calibrated probabilities.",
      "The production workflow performs dataset-level aggregation for uploaded CSV analysis.",
      "Detection results should be correlated with additional security telemetry before operational response.",
    ];

    const limitationBoxY =
      limitationTitleY + 5;

    // Slightly shorter box so Overall Assessment has
    // a comfortable independent area below it.
    const limitationBoxHeight = 33;

    roundedBox(
      14,
      limitationBoxY,
      182,
      limitationBoxHeight,
      COLORS.lighterGray,
      3
    );

    const leftLimitations =
      limitations.slice(
        0,
        3
      );

    const rightLimitations =
      limitations.slice(
        3,
        6
      );

    // IMPORTANT:
    // Right column numbering starts from 4.
    const drawLimitationColumn =
      (
        items,
        x,
        width,
        startingIndex
      ) => {
        let currentY =
          limitationBoxY + 5;

        items.forEach(
          (
            limitation,
            index
          ) => {
            const globalIndex =
              startingIndex +
              index;

            setText(
              6.6,
              "bold",
              COLORS.blue
            );

            doc.text(
              `${globalIndex + 1}.`,
              x,
              currentY
            );

            setText(
              6.25,
              "normal",
              COLORS.dark
            );

            const lines =
              doc.splitTextToSize(
                limitation,
                width - 8
              );

            doc.text(
              lines,
              x + 7,
              currentY
            );

            currentY +=
              Math.max(
                5,
                lines.length *
                  2.6
              ) + 1;
          }
        );
      };

    drawLimitationColumn(
      leftLimitations,
      19,
      80,
      0
    );

    drawLimitationColumn(
      rightLimitations,
      108,
      80,
      3
    );

    // ---------------------------------------------------------
    // OVERALL ASSESSMENT
    // ---------------------------------------------------------

    /*
     * IMPORTANT LAYOUT FIX:
     *
     * The previous version placed an additional validation note
     * between the heading and the assessment text. That note was
     * causing the visible overlap.
     *
     * It has been removed.
     *
     * The validation table at the top of this page already clearly
     * establishes that the metrics are held-out model metrics.
     */

    const overallTitleY =
      limitationBoxY +
      limitationBoxHeight +
      7;

    setText(
      12.5,
      "bold"
    );

    doc.text(
      "Overall Assessment",
      14,
      overallTitleY
    );

    const overallText =
      isNormal
        ? "The analysed dataset received a normal final classification. The result should be interpreted together with the model validation context and broader network telemetry."
        : `AEGIS-NSAI classified the analysed dataset as ${prediction} with ${confidence.toFixed(
            2
          )}% neural-model confidence. The result is supported by rule-based evidence and knowledge-driven security context, providing an interpretable basis for further investigation.`;

    setText(
      7.4,
      "normal",
      COLORS.dark
    );

    wrappedText(
      overallText,
      14,
      overallTitleY + 7,
      182,
      3.7
    );

    // No extra note here.
    // The held-out evaluation explanation is already above.

    drawFooter(4);

    // =========================================================
    // SAVE
    // =========================================================

    doc.save(
      "AEGIS-NSAI-Security-Analysis-Report.pdf"
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="info-card"
      style={{
        textAlign: "center",
      }}
    >
      <h3>
        Export Report
      </h3>

      <p
        style={{
          color: "#9ca3af",
          marginTop: "10px",
          marginBottom: "20px",
        }}
      >
        Download a professional four-page
        AEGIS-NSAI security analysis report
        containing detection evidence,
        threat intelligence, model validation
        and research context.
      </p>

      <button
        onClick={generatePDF}
        style={{
          padding: "14px 30px",
          border: "none",
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Download PDF Report
      </button>
    </div>
  );
}

export default DownloadReport;