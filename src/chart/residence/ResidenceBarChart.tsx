import React, { useEffect, useRef } from "react";
import Chart from "chart.js";
import AppProgress from "../../shared/component/progress/AppProgress";

interface Props {
  data: any;
}

const ResidenceBarChart: React.FC<Props> = (props: Props) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  let chart: Chart;

  const option: any = {
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          position: "top",
          ticks: {
            fontSize: 13,
          },
        },
      ],
      yAxes: [
        {
          barPercentage: 1,
          ticks: {
            autoSkip: false,
            fontSize: 13,
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        footer: (tooltipItem: any) => {
          return `Total: ${tooltipItem
            .filter((item: any) => item.datasetIndex > 0)
            .reduce((a: any, b: any) => a + Number(b.value), 0)}`;
        },
      },
    },
  };

  useEffect(() => {
    if (props.data) {
      const residenceMap = {};
      props.data.forEach((d: any) => {
        if (!residenceMap[d.CityMunRes]) {
          residenceMap[d.CityMunRes] = {
            admitted: 0,
            recovered: 0,
            death: 0,
            notAdmitted: 0,
          };
        }
        if (d.RemovalType === "Died") {
          residenceMap[d.CityMunRes].death =
            residenceMap[d.CityMunRes].death + 1;
        } else if (d.RemovalType === "Recovered") {
          residenceMap[d.CityMunRes].recovered =
            residenceMap[d.CityMunRes].recovered + 1;
        } else if (d.Admitted === "Yes") {
          residenceMap[d.CityMunRes].admitted =
            residenceMap[d.CityMunRes].admitted + 1;
        } else {
          residenceMap[d.CityMunRes].notAdmitted =
            residenceMap[d.CityMunRes].notAdmitted + 1;
        }
      });

      const labels = Object.keys(residenceMap)
        .filter((provCity: string) => provCity)
        .sort((provCity1: string, provCity2: string) => {
          const residence1: any = Object.values(residenceMap[provCity1]).reduce(
            (a: any, b: any) => a + b,
            0
          );
          const residence2: any = Object.values(residenceMap[provCity2]).reduce(
            (a: any, b: any) => a + b,
            0
          );
          return residence2 - residence1;
        });

      const datasets = [
        {
          label: "Active",
          backgroundColor: "#ffae42",
          data: labels.map((label: string) => {
            const _totalActive =
              residenceMap[label].admitted + residenceMap[label].notAdmitted;
            return _totalActive >= 0 ? _totalActive : 0;
          }),
          stack: "active",
        },
        {
          label: "Admitted",
          backgroundColor: "#ff5500",
          data: labels.map((label: string) => residenceMap[label].admitted),
          stack: "cases",
        },
        {
          label: "Recovered",
          backgroundColor: "#38a800",
          data: labels.map((label: string) => residenceMap[label].recovered),
          stack: "cases",
        },
        {
          label: "Deaths",
          backgroundColor: "#464646",
          data: labels.map((label: string) => residenceMap[label].death),
          stack: "cases",
        },
        {
          label: "Not Admitted",
          backgroundColor: "rgba(255, 190, 157, .6)",
          data: labels.map((label: string) => residenceMap[label].notAdmitted),
          stack: "cases",
        },
      ];

      const canvas: HTMLCanvasElement = chartRef.current as HTMLCanvasElement;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      chart = new Chart(canvas, {
        type: "horizontalBar",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: option,
      });
      chart.update();
    }
  }, [props.data]);

  return (
    <div style={{ height: "9600px" }}>
      {!props.data && <AppProgress />}
      <canvas
        ref={chartRef}
        style={{
          height: "9600px !important",
          position: "absolute",
          left: 0,
          top: 0,
        }}
      ></canvas>
    </div>
  );
};

export default ResidenceBarChart;
