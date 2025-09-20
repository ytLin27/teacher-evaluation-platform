import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const BoxPlotChart = ({ data, title, className = '', height = '300px' }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const ctx = canvasRef.current.getContext('2d');

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create box plot visualization using scatter plot
    chartRef.current = new ChartJS(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Department Average',
            data: data.departments ? data.departments.map((dept, index) => ({
              x: index,
              y: dept.average
            })) : [],
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            pointRadius: 8,
            pointHoverRadius: 10
          },
          {
            label: 'Your Score',
            data: data.currentScore ? [{
              x: data.currentPosition || 0,
              y: data.currentScore
            }] : [],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 3,
            pointRadius: 12,
            pointHoverRadius: 14,
            pointStyle: 'star'
          },
          // 25th Percentile line
          {
            label: '25th Percentile',
            data: data.percentiles ? data.percentiles.map((p, index) => ({
              x: index,
              y: p.p25
            })) : [],
            backgroundColor: 'rgba(156, 163, 175, 0.3)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 1,
            pointRadius: 4,
            showLine: true,
            fill: false
          },
          // 75th Percentile line
          {
            label: '75th Percentile',
            data: data.percentiles ? data.percentiles.map((p, index) => ({
              x: index,
              y: p.p75
            })) : [],
            backgroundColor: 'rgba(156, 163, 175, 0.3)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 1,
            pointRadius: 4,
            showLine: true,
            fill: false
          },
          // Median line
          {
            label: 'Median',
            data: data.percentiles ? data.percentiles.map((p, index) => ({
              x: index,
              y: p.median
            })) : [],
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            pointRadius: 6,
            showLine: true,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'point',
            intersect: false,
            callbacks: {
              title: (tooltipItems) => {
                const item = tooltipItems[0];
                if (data.departments && data.departments[item.dataIndex]) {
                  return data.departments[item.dataIndex].name;
                }
                return `Position ${item.parsed.x}`;
              },
              label: (context) => {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value.toFixed(2)}/5.0`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            display: true,
            title: {
              display: true,
              text: 'Departments'
            },
            ticks: {
              callback: function(value, index) {
                if (data.departments && data.departments[index]) {
                  return data.departments[index].name.slice(0, 8) + '...';
                }
                return value;
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Performance Score'
            },
            min: 0,
            max: 5,
            ticks: {
              stepSize: 0.5
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'xy',
          intersect: false
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, title]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default BoxPlotChart;