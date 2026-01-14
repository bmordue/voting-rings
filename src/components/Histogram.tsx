import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HistogramProps {
  data: number[];
  width?: number;
  height?: number;
}

export function Histogram({ data, width = 800, height = 400 }: HistogramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const frequency = new Map<number, number>();
    for (const value of data) {
      frequency.set(value, (frequency.get(value) || 0) + 1);
    }

    const histData = Array.from(frequency.entries())
      .map(([rounds, count]) => ({ rounds, count }))
      .sort((a, b) => a.rounds - b.rounds);

    const xScale = d3
      .scaleBand()
      .domain(histData.map(d => d.rounds.toString()))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(histData, d => d.count) || 0])
      .nice()
      .range([innerHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.35 0.06 250)');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.35 0.06 250)');

    g.selectAll('.domain, .tick line')
      .style('stroke', 'oklch(0.90 0.005 250)');

    const bars = g
      .selectAll('.bar')
      .data(histData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.rounds.toString()) || 0)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', 'oklch(0.70 0.14 200)')
      .attr('rx', 4)
      .style('cursor', 'pointer');

    bars
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('y', d => yScale(d.count))
      .attr('height', d => innerHeight - yScale(d.count));

    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'oklch(0.35 0.06 250)')
      .style('color', 'oklch(1 0 0)')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    bars
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', 'oklch(0.75 0.16 200)');

        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.rounds} rounds</strong><br/>${d.count} games (${((d.count / data.length) * 100).toFixed(1)}%)`);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', 'oklch(0.70 0.14 200)');

        tooltip.style('opacity', 0);
      });

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Space Grotesk, sans-serif')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', 'oklch(0.35 0.06 250)')
      .text('Rounds to Completion');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Space Grotesk, sans-serif')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', 'oklch(0.35 0.06 250)')
      .text('Frequency');

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Run a simulation to see results
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
