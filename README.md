# FastLanes Four-Slide Presentation Guide

**Paper:** Azim Afroozeh and Peter Boncz, _The FastLanes File Format_  
**Venue:** Proceedings of the VLDB Endowment, 18(11), 2025, pp. 4629–4643  
**DOI:** 10.14778/3749646.3749718  
**Target duration:** 5 minutes

---

# Slide 1: Modern analytics needs compression that is cheap to undo

## Purpose

This slide answers the first part of the focus question:

> **Why might modern analytics need a new storage format?**

The problem is not that formats such as Parquet fail to compress data. The problem is that heavy compression can make data expensive to decode on modern parallel hardware.

## What to say

“Analytical systems use columnar formats such as Parquet because columns usually compress well and queries can read only the required attributes.

However, established formats typically apply general-purpose compression, such as Snappy or Zstd, to relatively large blocks. This saves storage and reduces the number of bytes transferred from disk or memory, but it introduces another cost: the processor must decompress the block before it can work with the values.

That is increasingly problematic because modern analytics relies on SIMD instructions, GPUs, vectorized query engines, and AI workloads. These systems work best when computation consists of many regular, independent operations. Heavy-weight compression tends to create more irregular and CPU-intensive work.

The authors describe their objective as avoiding **‘overly CPU-intensive encodings.’**

Therefore, the motivation for FastLanes is not merely to create a smaller file. It is to make compressed data compatible with the way modern processors execute analytical work.”

## Direct quotation

> “avoiding overly CPU-intensive encodings”

**Source:** Abstract, page 1.

## Why this claim is justified

The paper distinguishes between two broad approaches:

- **Heavy-weight compression**, including general-purpose codecs such as Snappy and Zstd.
- **Light-weight compression**, including frame-of-reference, dictionary encoding, delta encoding, and run-length encoding.

Heavy-weight methods can produce compact data, but the paper argues that they are generally CPU-intensive and substantially slower than accessing uncompressed data.

Light-weight encodings exploit specific patterns and can use simpler, more regular operations. These operations are easier to parallelize using SIMD instructions and GPUs.

The paper also notes that modern query engines increasingly support **compressed execution**. This means an operator may sometimes work with an encoded vector instead of reconstructing every original value.

## How to explain the visual

The visual presents two requirements:

1. **Storage must remain compact.**
2. **Processing must remain parallel.**

The descending bars under **Storage** represent fewer bytes.

The horizontal lines under **Processing** represent independent SIMD or GPU execution lanes.

The argument is that a modern format should achieve both goals rather than optimizing storage at the expense of processing.

## Important wording

Do not say:

> “Parquet is slow.”

Say:

> “Parquet’s heavy-weight compressed blocks can make decompression a significant part of scan cost.”

Parquet can still perform effectively when storage or network I/O dominates. The paper’s criticism concerns the relationship between its compression model and modern execution hardware.

## Transition

> “FastLanes addresses this trade-off by replacing one heavy decompression step with a sequence of simpler, data-parallel encodings.”

---

# Slide 2: FastLanes wins by stacking simple encodings

## Purpose

This slide explains the paper’s central contribution:

> **Expression Encoding combines several simple encodings so that FastLanes can compress effectively without introducing a heavy decoding algorithm.**

This is the most important slide, so spend approximately two minutes on it.

## What to say

“FastLanes’ central idea is called **Expression Encoding**. Instead of applying one general-purpose compressor to an entire column block, it composes several small, type-specific encoding operations.

Consider the repeated strings shown on the slide: Alice, Alice, Bob, Bob. Dictionary encoding can first replace Alice with zero and Bob with one. Those integer codes are much smaller and more regular than the original strings. A frame-of-reference operation can then store the codes using very few bits.

The important point is that neither operation needs to solve the whole compression problem. One operation captures repetition, while the next captures the small numerical range. Together, they provide stronger compression.

The paper describes these operators as transformations that can be combined into **‘a chain, forming Encoding Expressions.’**

FastLanes also looks for relationships between columns. If two columns are identical, it can store an equality relationship instead of compressing both independently. If a name always corresponds to the same ID, the format can reuse codes from one column in another.

Finally, FastLanes organizes data into vectors of 1,024 values. This lets the engine retrieve and decode small, predictable units rather than decompressing a large block. The engine can also stop partway through an expression if an intermediate encoded representation is already useful.

Therefore, the main contribution is not one novel codec. It is a file format that stores combinations of simple encodings and allows the query engine to interpret those combinations efficiently.”

## Direct quotation

> “Multiple of these operators can be combined in a chain, forming Encoding Expressions.”

**Source:** Section 2.1, page 3.

## Why this claim is justified

### 1. Cascading captures more than one pattern

A single encoding normally exploits one characteristic:

- **Dictionary encoding** captures repeated values.
- **Frame-of-reference** captures values within a small numerical range.
- **Delta encoding** captures small differences between adjacent values.
- **Run-length encoding** captures consecutive repetitions.
- **FSST** compresses strings using a compact symbol table.

Expression Encoding allows FastLanes to apply these ideas sequentially.

For example:

```text
Alice, Alice, Bob, Bob
          ↓ Dictionary encoding
0, 0, 1, 1
          ↓ Frame-of-reference and bit-packing
Compact packed integers
```

Dictionary encoding captures the repeated strings. Frame-of-reference then exploits the small range of the resulting integer codes.

### 2. FastLanes does not exhaustively search every expression

The possible number of operator combinations is extremely large. FastLanes therefore uses a two-phase selection process.

#### Rule-based phase

The selector first detects properties such as:

- constant columns;
- equality between columns;
- strings that contain numerical values;
- narrower numerical types;
- one-to-one mappings between columns.

#### Sampling phase

For the remaining columns, FastLanes tests candidate expressions on selected parts of the data.

Its **three-way sampling** method uses:

- the first vector;
- the last vector;
- the middle vector.

Each vector contains 1,024 values.

The paper reports that using only these three vectors achieves more than 99% accuracy relative to evaluating every vector when selecting the best expression by compression ratio.

### 3. The 1,024-value unit is deliberate

Using vectors of 1,024 values supports:

- vectorized execution;
- a limited working set;
- fine-grained access;
- partial decompression;
- efficient use of CPU and GPU caches;
- the possibility of retaining intermediate encoded vectors.

The file format therefore plays an execution role rather than acting solely as a passive storage container.

## Concrete example from the paper

The paper presents a table containing four columns:

- `Name`
- `Institute`
- `ID`
- `Alias`

FastLanes encodes them differently:

| Column      | Encoding idea                                               |
| ----------- | ----------------------------------------------------------- |
| `Name`      | Dictionary encoding followed by frame-of-reference          |
| `Institute` | Constant encoding because every value is `CWI`              |
| `ID`        | External dictionary because each name corresponds to one ID |
| `Alias`     | Equality because it duplicates `Name`                       |

This example demonstrates how FastLanes can avoid storing the same information repeatedly.

## What not to explain

Do not list every operator in the paper.

For a five-minute pitch, the audience only needs to understand three points:

1. Simple encodings can be chained.
2. Relationships between columns can be reused.
3. Data can be accessed in small vectors.

## Transition

> “The key question is whether these simpler expressions remain competitive in compression while actually improving decoding speed. The Public BI evaluation tests both sides of that claim.”

---

# Slide 3: FastLanes decoded Public BI about 44× faster

## Purpose

This slide presents one experimental result properly by identifying:

- the workload;
- the baselines;
- the metric;
- the numerical result;
- what the result supports.

Avoid presenting “44× faster” without this context.

## What to say

“The authors evaluate FastLanes using 36 datasets from the Public BI benchmark, covering 2,289 columns.

The comparison includes FastLanes, Parquet with Snappy, Parquet with Zstd, BtrBlocks, and DuckDB.

The metric shown here is **total decoding time**, so lower values are better. FastLanes required 16.32 milliseconds. Parquet with Snappy required 712.55 milliseconds, while Parquet with Zstd required 731.45 milliseconds.

The paper therefore reports that FastLanes was approximately 43 times faster than Parquet with Snappy and 44 times faster than Parquet with Zstd in this decoding experiment.

The authors summarize the broader result by saying that **‘FastLanes is faster on all datasets.’**

Crucially, this speed was not achieved by storing substantially more data. On Public BI, FastLanes compressed 41% better than Parquet with Snappy and 2% better than Parquet with Zstd.

This supports the paper’s central claim: compression and processing speed are not necessarily opposites. If compression reduces the amount of data moved while using inexpensive, parallel decoding operations, compressed processing may be faster.”

## Direct quotation

> “FastLanes is faster on all datasets”

**Source:** Section 4, “Decoding and Encoding Speed,” page 9.

## Experimental context

### Workload

- **Benchmark:** Public BI
- **Datasets:** 36
- **Columns:** 2,289
- **Sample size:** 65,536 records from each table for most datasets

### Baselines

- Parquet with Snappy
- Parquet with Zstd
- BtrBlocks
- DuckDB

### Metric

**Total decoding time**, measured in milliseconds.

Lower values are better.

## Main result

| Format           | Total decoding time |
| ---------------- | ------------------: |
| FastLanes        |        **16.32 ms** |
| BtrBlocks        |           115.43 ms |
| DuckDB           |           483.45 ms |
| Parquet + Snappy |           712.55 ms |
| Parquet + Zstd   |           731.45 ms |

The relevant comparisons are:

- FastLanes versus Parquet + Snappy: approximately **43× faster**
- FastLanes versus Parquet + Zstd: approximately **44× faster**

## Compression result

On the Public BI datasets, FastLanes also compressed:

- **41% better than Parquet + Snappy**
- **2% better than Parquet + Zstd**

This matters because FastLanes did not obtain its decoding advantage simply by storing much more data.

## Why the result supports the paper’s claim

Two effects reinforce one another.

### Effect 1: Compression reduces data movement

A compressed representation requires fewer bytes to travel through:

- storage;
- network;
- main memory;
- CPU cache.

Database scans are frequently limited by memory bandwidth rather than arithmetic performance.

### Effect 2: Lightweight decoding reduces CPU overhead

FastLanes operators use regular operations with limited dependencies. This helps compilers generate SIMD instructions and enables more parallel execution.

The paper’s SIMD experiment supports this explanation. Compiling FastLanes for AVX-512 improved its decoding performance by nearly 40%, whereas the benefits for Parquet and BtrBlocks were negligible in the same comparison.

## Be precise about the claim

Do not say:

> “FastLanes makes database queries 44× faster.”

Say:

> “FastLanes decoded the tested Public BI rowgroups approximately 44× faster than Parquet with Zstd.”

The experiment measures decoding, not complete SQL query runtime.

## How to present the chart

Mention only three values aloud:

- FastLanes: **16.32 ms**
- Parquet + Snappy: **712.55 ms**
- Parquet + Zstd: **731.45 ms**

Do not read every BtrBlocks and DuckDB value unless someone asks about them.

## Transition

> “The codec result is strong, but it does not yet prove that a complete analytical query becomes 44 times faster.”

---

# Slide 4: The codec result is convincing, but the query result is missing

## Purpose

This slide demonstrates critical understanding rather than merely repeating the paper’s conclusion.

Communicate two points:

1. Where FastLanes appears useful.
2. What the paper has not yet established.

## What to say

“Our assessment is that FastLanes is particularly promising for scan-heavy analytics where memory bandwidth and decompression are important.

It should be most useful when columns contain repeated values, small numerical ranges, or relationships that can be reused across columns.

However, the main limitation is that this paper evaluates compression, decoding, random access, and SIMD performance rather than complete analytical queries.

The authors acknowledge this directly: **‘we left a full evaluation of FastLanes integrated in a query engine for the future.’**

That means a 44-times decoding advantage should not be interpreted as a 44-times improvement for joins, aggregations, or an entire DuckDB workload. Other operations may dominate total execution time.

There is also evidence that the method is workload-sensitive. On TPC-H, Parquet with Zstd compressed 15.3% better. The paper attributes this partly to normalized data having fewer cross-column compression opportunities and partly to synthetic patterns that the current selector does not recognize.

Our conclusion is that FastLanes convincingly demonstrates the value of hardware-friendly compression. The next step is to determine how much of that advantage survives in complete query-engine execution.”

## Direct quotation

> “we left a full evaluation of FastLanes integrated in a query engine for the future.”

**Source:** Section 8, “End-to-End Benchmark,” page 12.

## Why this is a fair limitation

The paper explicitly identifies an end-to-end benchmark as future work.

The evaluation demonstrates improvements in:

- compression ratio;
- encoding and decoding time;
- random access;
- SIMD acceleration;
- fine-grained access.

However, a complete analytical query may also include:

- filtering;
- expression evaluation;
- joins;
- aggregation;
- sorting;
- result materialization.

If decompression accounts for only a small fraction of total query time, a large decoding improvement may result in a smaller overall improvement.

This is related to **Amdahl’s law**: improving one component changes total execution time only in proportion to the time originally spent in that component.

## Why the TPC-H result matters

The TPC-H result prevents the conclusion from becoming too broad.

For the tested TPC-H data, Parquet with Zstd compressed **15.3% better than FastLanes**.

The paper provides two explanations:

1. TPC-H is normalized, so related information is divided across tables. This reduces opportunities for multi-column compression.
2. TPC-H contains synthetic patterns, including numbers embedded in strings, that the current FastLanes rules do not recognize.

The authors suggest that future encoding expressions could capture these patterns. Nevertheless, the current result demonstrates that FastLanes is not uniformly superior on every dataset.

## Where FastLanes should be useful

FastLanes appears most suitable for:

- scan-heavy analytical workloads;
- repeated or low-cardinality values;
- wide tables containing correlated columns;
- workloads limited by memory bandwidth;
- vectorized query execution;
- CPU SIMD or GPU processing;
- engines that can operate directly on compressed vectors.

It may provide a smaller advantage when:

- joins or aggregations dominate total runtime;
- data is highly normalized;
- columns have few exploitable relationships;
- the data contains patterns outside the current expression pool;
- query engines always fully materialize decoded values.

## Final sentence to memorize

> “FastLanes shows that compression can become part of query execution, but its full value will depend on whether query engines can exploit the encoded representation end to end.”

Stop after this sentence. Do not introduce another technical detail.

---

# Direct quotations by slide

| Slide | Direct quotation                                                                        | Purpose                                                       |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1     | “avoiding overly CPU-intensive encodings”                                               | Establishes that processing cost is a central design concern. |
| 2     | “Multiple of these operators can be combined in a chain, forming Encoding Expressions.” | Defines the central method.                                   |
| 3     | “FastLanes is faster on all datasets”                                                   | Supports the consistency of the Public BI decoding result.    |
| 4     | “we left a full evaluation of FastLanes integrated in a query engine for the future.”   | Establishes the main limitation.                              |

Introduce quotations with language such as:

> “The authors describe this as…”

or:

> “The paper states that…”

This distinguishes the authors’ findings from the group’s interpretation.

---

# Likely Questions and Answers

## Does better compression always mean faster processing?

No. Better compression reduces the amount of data transferred, but a complex codec can consume more CPU time than it saves.

FastLanes’ claim is that lightweight, data-parallel decoding can combine both benefits:

- fewer bytes moved;
- relatively inexpensive decoding.

## Why not simply keep the data uncompressed?

Uncompressed data avoids decompression, but it increases:

- storage consumption;
- network traffic;
- memory traffic;
- cache pressure.

The paper argues that lightweight decoding can be inexpensive enough that compressed data is faster to process because fewer bytes must move through the memory hierarchy.

## Is FastLanes just another compression algorithm?

Not exactly.

FastLanes is a file format that:

- records expressions made from multiple encoding operators;
- stores encoded components in a segmented layout;
- supports relationships between columns;
- exposes vector-level access;
- allows partial decompression;
- can return intermediate compressed vectors.

## What is the strongest experimental evidence?

The strongest result is the Public BI decoding experiment:

- FastLanes: **16.32 ms**
- Parquet + Snappy: **712.55 ms**
- Parquet + Zstd: **731.45 ms**

FastLanes therefore decoded the tested data approximately:

- **43× faster than Parquet + Snappy**
- **44× faster than Parquet + Zstd**

FastLanes also maintained competitive or better compression on Public BI.

## What is the biggest weakness?

The absence of a full query-engine evaluation.

The paper demonstrates improvements in codecs, decoding, random access, and compressed-vector access. It does not show an equivalent end-to-end improvement for complete joins, aggregations, or analytical query pipelines.

## Why did Parquet with Zstd compress TPC-H better?

The paper identifies two reasons:

1. TPC-H is normalized, so it provides fewer cross-column compression opportunities.
2. TPC-H contains synthetic patterns that the current FastLanes expression selector does not recognize.

In that experiment, Parquet with Zstd compressed the data **15.3% better than FastLanes**.

## Where would FastLanes be most useful?

FastLanes should be most useful for:

- scan-heavy analytics;
- bandwidth-sensitive workloads;
- repeated or correlated columns;
- vectorized query engines;
- SIMD and GPU execution;
- engines that can retain and process compressed vectors.

## Could FastLanes replace Parquet immediately?

Not based on this paper alone.

FastLanes v0.1 is a research implementation. The paper identifies several areas for continued development, including:

- DuckDB reader and writer integration;
- complete query-engine evaluation;
- schema evolution;
- encryption;
- nested data;
- wide and sparse machine-learning data.

The paper establishes a promising storage and execution model, but not yet a production replacement for the broader Parquet ecosystem.

---

## One-sentence answer to the focus question

Modern analytics needs a new storage format because formats such as Parquet rely on large-block, general-purpose compression that saves space but is expensive to decode, whereas FastLanes combines lightweight encodings into data-parallel compression expressions that retain strong compression while decoding efficiently with SIMD and potentially GPUs.

# FastLanes refined four-slide pitch

Design system:

- Background: #F7F4EE
- Ink: #1F1F1F
- Muted text: #6B6B6B
- Accent: #B5532F
- Headlines: Georgia
- Body: Calibri
- Slide size: LAYOUT_WIDE, 13.333 x 7.5 inches

The four slides deliberately use different compositions: asymmetric editorial opening, process strip, big-number evidence slide, and assessment/quote layout.

Run `node src/make_deck_refined.js` in an environment with `pptxgenjs` and the Copilot PptxGenJS helper library. Update the output path for local use.
