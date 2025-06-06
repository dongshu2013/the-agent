/**
 * Performance Comparison: listElements vs analyzeDOMV2
 *
 * This utility compares the performance and output quality of the traditional
 * listElements approach versus the new analyzeDOMV2 approach for AI agents.
 */

import { WebToolkit } from './web-toolkit';

export interface PerformanceMetrics {
  method: 'listElements' | 'analyzeDOMV2';
  executionTime: number;
  elementCount: number;
  outputSize: number;
  memoryUsage?: number;
  compressionRatio?: number;
  aiReadabilityScore: number;
}

export interface ComparisonResult {
  listElementsMetrics: PerformanceMetrics;
  analyzeDOMV2Metrics: PerformanceMetrics;
  improvement: {
    speedImprovement: number; // percentage
    sizeReduction: number; // percentage
    elementCountIncrease: number; // percentage
    aiReadabilityImprovement: number; // percentage
  };
  recommendation: string;
  summary: string;
}

export class PerformanceComparator {
  private webToolkit: WebToolkit;

  constructor() {
    this.webToolkit = new WebToolkit();
  }

  /**
   * Calculate AI readability score based on structure and format
   */
  private calculateAIReadabilityScore(output: any, method: string): number {
    let score = 0;

    if (method === 'listElements') {
      // Traditional approach - evaluate element list structure
      if (output.elements && Array.isArray(output.elements)) {
        score += 30; // Basic structure

        // Check for useful metadata
        const firstElement = output.elements[0];
        if (firstElement) {
          if (firstElement.text) score += 10;
          if (firstElement.attributes) score += 10;
          if (firstElement.isVisible !== undefined) score += 10;
          if (firstElement.isInteractive !== undefined) score += 10;
          if (firstElement.elementState) score += 10;
        }

        // Penalty for verbose structure
        const avgElementSize = JSON.stringify(output).length / output.elements.length;
        if (avgElementSize > 500) score -= 10;
      }
    } else {
      // analyzeDOMV2 approach
      if (output.analysis) {
        score += 40; // Better structure

        // Check for AI-optimized features
        if (output.analysis.clickableElementsString) score += 20; // AI-friendly string
        if (output.analysis.segments) score += 10; // Semantic segments
        if (output.analysis.highlightedElements) score += 10; // Highlighted elements
        if (output.analysis.elementMap) score += 10; // Element mapping

        // Bonus for performance metrics
        if (output.performance) score += 10;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Run comprehensive performance comparison
   */
  async comparePerformance(): Promise<ComparisonResult> {
    console.log('🔄 Starting performance comparison...');

    // Test listElements performance
    const listElementsStart = Date.now();
    const listElementsResult = await this.webToolkit.listElements(
      'button, input, select, textarea, a, [role="button"], [role="link"], [tabindex]'
    );
    const listElementsTime = Date.now() - listElementsStart;

    let listElementsMetrics: PerformanceMetrics = {
      method: 'listElements',
      executionTime: listElementsTime,
      elementCount: 0,
      outputSize: 0,
      aiReadabilityScore: 0,
    };

    if (listElementsResult.success && listElementsResult.data) {
      const outputString = JSON.stringify(listElementsResult.data);
      listElementsMetrics = {
        ...listElementsMetrics,
        elementCount: listElementsResult.data.elements.length,
        outputSize: outputString.length,
        aiReadabilityScore: this.calculateAIReadabilityScore(
          listElementsResult.data,
          'listElements'
        ),
      };
    }

    // Test analyzeDOMV2 performance
    const analyzeDOMV2Start = Date.now();
    const analyzeDOMV2Result = await this.webToolkit.analyzeDOMV2();
    const analyzeDOMV2Time = Date.now() - analyzeDOMV2Start;

    let analyzeDOMV2Metrics: PerformanceMetrics = {
      method: 'analyzeDOMV2',
      executionTime: analyzeDOMV2Time,
      elementCount: 0,
      outputSize: 0,
      aiReadabilityScore: 0,
    };

    if (analyzeDOMV2Result.success && analyzeDOMV2Result.data) {
      // For AI usage, we primarily care about the clickableElementsString size
      const aiOutputSize = analyzeDOMV2Result.data.analysis.clickableElementsString.length;

      analyzeDOMV2Metrics = {
        ...analyzeDOMV2Metrics,
        elementCount: analyzeDOMV2Result.data.analysis.totalElements,
        outputSize: aiOutputSize, // Use AI-optimized output size
        compressionRatio:
          analyzeDOMV2Result.data.performance.pageSize > 0
            ? (aiOutputSize / analyzeDOMV2Result.data.performance.pageSize) * 100
            : 0,
        aiReadabilityScore: this.calculateAIReadabilityScore(
          analyzeDOMV2Result.data,
          'analyzeDOMV2'
        ),
      };
    }

    // Calculate improvements
    const speedImprovement =
      listElementsMetrics.executionTime > 0
        ? ((listElementsMetrics.executionTime - analyzeDOMV2Metrics.executionTime) /
            listElementsMetrics.executionTime) *
          100
        : 0;

    const sizeReduction =
      listElementsMetrics.outputSize > 0
        ? ((listElementsMetrics.outputSize - analyzeDOMV2Metrics.outputSize) /
            listElementsMetrics.outputSize) *
          100
        : 0;

    const elementCountIncrease =
      listElementsMetrics.elementCount > 0
        ? ((analyzeDOMV2Metrics.elementCount - listElementsMetrics.elementCount) /
            listElementsMetrics.elementCount) *
          100
        : 0;

    const aiReadabilityImprovement =
      listElementsMetrics.aiReadabilityScore > 0
        ? ((analyzeDOMV2Metrics.aiReadabilityScore - listElementsMetrics.aiReadabilityScore) /
            listElementsMetrics.aiReadabilityScore) *
          100
        : 0;

    // Generate recommendation
    let recommendation = '';
    if (sizeReduction > 50 && aiReadabilityImprovement > 20) {
      recommendation =
        'STRONGLY RECOMMENDED: Use analyzeDOMV2 for significant performance and AI compatibility improvements.';
    } else if (sizeReduction > 20 || aiReadabilityImprovement > 10) {
      recommendation = 'RECOMMENDED: Use analyzeDOMV2 for better performance and AI integration.';
    } else {
      recommendation =
        'CONSIDER: analyzeDOMV2 provides structural improvements, evaluate based on specific use case.';
    }

    // Generate summary
    const summary =
      `analyzeDOMV2 ${speedImprovement > 0 ? 'improved' : 'changed'} execution time by ${Math.abs(speedImprovement).toFixed(1)}%, ` +
      `reduced output size by ${sizeReduction.toFixed(1)}%, ` +
      `found ${elementCountIncrease > 0 ? 'more' : 'fewer'} elements (+${elementCountIncrease.toFixed(1)}%), ` +
      `and improved AI readability by ${aiReadabilityImprovement.toFixed(1)}%.`;

    return {
      listElementsMetrics,
      analyzeDOMV2Metrics,
      improvement: {
        speedImprovement,
        sizeReduction,
        elementCountIncrease,
        aiReadabilityImprovement,
      },
      recommendation,
      summary,
    };
  }

  /**
   * Print detailed comparison report
   */
  async printComparisonReport(): Promise<void> {
    const result = await this.comparePerformance();

    console.debug('\n📊 DOM ANALYSIS PERFORMANCE COMPARISON REPORT');
    console.debug('═══════════════════════════════════════════════════════════');

    console.debug('\n🔍 METHOD COMPARISON:');
    console.debug('┌─────────────────┬─────────────────┬─────────────────┐');
    console.debug('│ Metric          │ listElements    │ analyzeDOMV2    │');
    console.debug('├─────────────────┼─────────────────┼─────────────────┤');
    console.debug(
      `│ Execution Time  │ ${result.listElementsMetrics.executionTime.toString().padEnd(13)}ms │ ${result.analyzeDOMV2Metrics.executionTime.toString().padEnd(13)}ms │`
    );
    console.debug(
      `│ Element Count   │ ${result.listElementsMetrics.elementCount.toString().padEnd(15)} │ ${result.analyzeDOMV2Metrics.elementCount.toString().padEnd(15)} │`
    );
    console.debug(
      `│ Output Size     │ ${result.listElementsMetrics.outputSize.toString().padEnd(13)}b  │ ${result.analyzeDOMV2Metrics.outputSize.toString().padEnd(13)}b  │`
    );
    console.debug(
      `│ AI Readability  │ ${result.listElementsMetrics.aiReadabilityScore.toString().padEnd(13)}/100 │ ${result.analyzeDOMV2Metrics.aiReadabilityScore.toString().padEnd(13)}/100 │`
    );
    console.debug('└─────────────────┴─────────────────┴─────────────────┘');

    console.debug('\n📈 IMPROVEMENTS:');
    console.debug(
      `⚡ Speed: ${result.improvement.speedImprovement > 0 ? '+' : ''}${result.improvement.speedImprovement.toFixed(1)}%`
    );
    console.debug(`📦 Size Reduction: ${result.improvement.sizeReduction.toFixed(1)}%`);
    console.debug(
      `🎯 Element Detection: ${result.improvement.elementCountIncrease > 0 ? '+' : ''}${result.improvement.elementCountIncrease.toFixed(1)}%`
    );
    console.debug(
      `🤖 AI Readability: ${result.improvement.aiReadabilityImprovement > 0 ? '+' : ''}${result.improvement.aiReadabilityImprovement.toFixed(1)}%`
    );

    if (result.analyzeDOMV2Metrics.compressionRatio) {
      console.debug(
        `🗜️  Compression Ratio: ${result.analyzeDOMV2Metrics.compressionRatio.toFixed(1)}% of original page`
      );
    }

    console.debug('\n💡 RECOMMENDATION:');
    console.debug(result.recommendation);

    console.debug('\n📋 SUMMARY:');
    console.debug(result.summary);

    console.debug('\n🎯 KEY ADVANTAGES OF analyzeDOMV2:');
    console.debug('• Highlight index system for reliable element referencing');
    console.debug('• AI-optimized string format: [index]<type>text</type>');
    console.debug('• Semantic page segmentation (header, nav, main, footer)');
    console.debug('• Comprehensive accessibility metadata');
    console.debug('• Form context and label associations');
    console.debug('• Performance metrics and optimization data');
    console.debug('• Reduced data transfer for AI processing');

    console.debug('\n═══════════════════════════════════════════════════════════\n');
  }
}

/**
 * Quick comparison function for easy testing
 */
export async function quickComparison(): Promise<ComparisonResult> {
  const comparator = new PerformanceComparator();
  return await comparator.comparePerformance();
}

/**
 * Run and print detailed comparison report
 */
export async function runComparisonReport(): Promise<void> {
  const comparator = new PerformanceComparator();
  await comparator.printComparisonReport();
}
