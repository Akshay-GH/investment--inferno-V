import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
const CHART_URL=import.meta.env.VITE_CHART;

export default function CandleStickChart({ stockSymbol, height, upColor, downColor, showTooltip }) {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const candleSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const [data, setData] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState("none");
  const [indicatorPeriod, setIndicatorPeriod] = useState(14);

  // Indicator calculation functionss
  const calculateSMA = (data, period) => {
    if (!data || data.length < period) return [];
    const smaData = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, item) => acc + item.close, 0);
      smaData.push({ time: data[i].time, value: sum / period });
    }
    return smaData;
  };

  const calculateEMA = (data, period) => {
    if (!data || data.length < period) return [];
    const multiplier = 2 / (period + 1);
    const emaData = [];
    let ema = data.slice(0, period).reduce((sum, item) => sum + item.close, 0) / period;
    emaData.push({ time: data[period - 1].time, value: ema });
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
      emaData.push({ time: data[i].time, value: ema });
    }
    return emaData;
  };

  const calculateRSI = (data, period) => {
    if (!data || data.length < period + 1) return [];
    const rsiData = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change >= 0) gains += change;
      else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiData.push({ time: data[period].time, value: 100 - (100 / (1 + rs)) });

    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const currentGain = change >= 0 ? change : 0;
      const currentLoss = change < 0 ? Math.abs(change) : 0;
      
      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiData.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
    }
    return rsiData;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartInstance.current = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#1a1a1a" },
        textColor: "#ffffff"
      },
      width: chartContainerRef.current.clientWidth,
      height: height || 500,
      timeScale: { 
        timeVisible: true, 
        borderColor: "#333333",
        barSpacing: 8
      },
      rightPriceScale: { borderColor: "#333333" },
      grid: {
        vertLines: { color: "#333333" },
        horzLines: { color: "#333333" },
      }
    });

    candleSeriesRef.current = chartInstance.current.addCandlestickSeries({
      upColor: upColor || "#26a69a",
      downColor: downColor || "#ef5350",
      wickUpColor: upColor || "#26a69a",
      wickDownColor: downColor || "#ef5350",
      borderVisible: false,
      priceLineVisible: false
    });

    // Crosshair subscription
    chartInstance.current.subscribeCrosshairMove(param => {
      if (!candleSeriesRef.current || !param.time) return;
      const priceData = param.seriesPrices.get(candleSeriesRef.current);
      const indicatorData = indicatorSeriesRef.current ? param.seriesPrices.get(indicatorSeriesRef.current) : null;
      
      if (priceData) {
        const hoverInfo = {
          date: new Date(param.time * 1000).toLocaleDateString(),
          open: priceData.open,
          high: priceData.high,
          low: priceData.low,
          close: priceData.close
        };

        if (indicatorData) {
          hoverInfo.indicatorValue = indicatorData.value;
        }

        setHoverData(hoverInfo);
      }
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(entries => {
      chartInstance.current.applyOptions({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
    };
  }, []);

  // Update indicator when selection or period changes
  useEffect(() => {
    if (!chartInstance.current || !data.length) return;

    // Remove previous indicator series
    if (indicatorSeriesRef.current) {
      chartInstance.current.removeSeries(indicatorSeriesRef.current);
      indicatorSeriesRef.current = null;
    }

    // Add new indicator if selected
    if (selectedIndicator !== "none") {
      let indicatorData = [];
      let seriesOptions = {};
      
      switch (selectedIndicator) {
        case "sma":
          indicatorData = calculateSMA(data, indicatorPeriod);
          seriesOptions = { color: "#FFA500", lineWidth: 2 };
          break;
        case "ema":
          indicatorData = calculateEMA(data, indicatorPeriod);
          seriesOptions = { color: "#00BFFF", lineWidth: 2 };
          break;
        case "ema20":
          indicatorData = calculateEMA(data, 20);
          seriesOptions = { color: "#FF69B4", lineWidth: 2 };
          break;
        case "rsi":
          // For RSI, we'll display it in the main chart area
          indicatorData = calculateRSI(data, indicatorPeriod);
          seriesOptions = { 
            color: "#7CFC00", 
            lineWidth: 2,
            // Scale RSI to price axis (0-100 range)
            priceScaleId: 'left',
            priceFormat: {
              type: 'custom',
              formatter: (price) => price.toFixed(2)
            }
          };
          break;
        default:
          break;
      }

      if (indicatorData.length > 0) {
        indicatorSeriesRef.current = chartInstance.current.addLineSeries(seriesOptions);
        indicatorSeriesRef.current.setData(indicatorData);
        
        // Adjust price scale for RSI
        if (selectedIndicator === "rsi") {
          indicatorSeriesRef.current.applyOptions({
            priceScaleId: 'left'
          });
          chartInstance.current.priceScale('left').applyOptions({
            mode: 2, // Logarithmic mode for better RSI display
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          });
        }
      }
    }
  }, [selectedIndicator, indicatorPeriod, data]);

  // const fetchStockData = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:8000/stock_chart_data/${stockSymbol}/`);
  //     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  //     const jsonData = await response.json();
      
  //     if (!jsonData.error) {
  //       const sortedData = jsonData.sort((a, b) => a.time - b.time);
  //       if (candleSeriesRef.current) {
  //         candleSeriesRef.current.setData(
  //           sortedData.map(item => ({
  //             time: item.time,
  //             open: item.open,
  //             high: item.high,
  //             low: item.low,
  //             close: item.close
  //           }))
  //         );
  //       }
  //       setData(sortedData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching stock data:", error);
  //   }
  // };

  const fetchStockData = async () => {
    try {
      const response = await fetch(`${CHART_URL}${stockSymbol}/`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const jsonData = await response.json();
      
  
      if (!jsonData.error) {
        // Step 1: Sort by time (ascending)
        const sortedData = jsonData.sort((a, b) => a.time - b.time);
  
        // Step 2: Remove duplicates based on 'time'
        const uniqueData = sortedData.filter((item, index, arr) => {
          return index === 0 || item.time !== arr[index - 1].time;
        });
  
      
      if (data.length === 0) {
        candleSeriesRef.current.setData(uniqueData);
        setData(uniqueData);
      } else {
        const lastNewItem = uniqueData[uniqueData.length - 1];
        const lastOldItem = data[data.length - 1];

        // Only update if new candle or changed candle
        if (lastNewItem.time > lastOldItem.time) {
          candleSeriesRef.current.update(lastNewItem);
          setData(prev => [...prev, lastNewItem]);
        } else if (lastNewItem.time === lastOldItem.time &&
                   (lastNewItem.open !== lastOldItem.open ||
                    lastNewItem.high !== lastOldItem.high ||
                    lastNewItem.low !== lastOldItem.low ||
                    lastNewItem.close !== lastOldItem.close)) {
          candleSeriesRef.current.update(lastNewItem);
          setData(prev => [...prev.slice(0, -1), lastNewItem]);
        }
      }
    }

    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };
  

  // Setup interval for data updates
  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 2000);
    return () => clearInterval(interval);
  }, [stockSymbol]);

  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg">
      <div className="flex gap-4 mb-4">
        <select 
          value={selectedIndicator}
          onChange={(e) => setSelectedIndicator(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="none">No Indicator</option>
          <option value="sma">SMA</option>
          <option value="ema">EMA</option>
          <option value="ema20">EMA 20</option>
          <option value="rsi">RSI</option>
        </select>
        
        {selectedIndicator !== "none" && selectedIndicator !== "ema20" && (
          <select
            value={indicatorPeriod}
            onChange={(e) => setIndicatorPeriod(Number(e.target.value))}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <option value="7">7 Periods</option>
            <option value="14">14 Periods</option>
            <option value="20">20 Periods</option>
            <option value="50">50 Periods</option>
            <option value="200">200 Periods</option>
          </select>
        )}
      </div>

      {hoverData && (
        <div className="bg-black/80 text-white p-3 rounded-lg mb-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Date:</span> <span>{hoverData.date}</span>
            <span>Open:</span> <span>₹{hoverData.open?.toLocaleString()}</span>
            <span>High:</span> <span>₹{hoverData.high?.toLocaleString()}</span>
            <span>Low:</span> <span>₹{hoverData.low?.toLocaleString()}</span>
            <span>Close:</span> <span>₹{hoverData.close?.toLocaleString()}</span>
            {hoverData.indicatorValue !== undefined && (
              <>
                <span>{selectedIndicator.toUpperCase()} {selectedIndicator === "ema20" ? "20" : indicatorPeriod}:</span>
                <span>
                  {selectedIndicator === "rsi" ? 
                    hoverData.indicatorValue?.toFixed(2) : 
                    `₹${hoverData.indicatorValue?.toFixed(2)}`}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-[500px]" />
    </div>
  );
}



