# Project Issues

---

## Issue 1: Set up the repository

**Labels:** `setup`, `priority-high`

**Tasks**

- [ ] Create folders for `data`, `scrapers`, `baselines`, `llm`, `evaluation` and `app`.
- [ ] Add `requirements.txt`.
- [ ] Add a short README with installation and run instructions.
- [ ] Add `.gitignore` for model files, datasets and environment files.
- [ ] Include a small example dataset so the project runs without a new scrape.

**Definition of done:** A new team member can clone the repository, install dependencies and run one example.

---

## Issue 2: Finish the Auchan Luxembourg product scraper

**Labels:** `scraper`, `data`, `priority-high`

**Goal:** Extend the preliminary collector so the project has a useful fixed product snapshot.

**Relevance to the project proposal:** Sections 3.1–3.2 propose one dated snapshot per shop. The preliminary run on 12 November 2026 collected 50 Auchan Munsbach products across 30 categories. Names and prices were available for all 50, package size for 48, brand for 46 and unit price for 45. Promotion text was not captured and is explicitly identified as the next collector improvement.

**Tasks**

- [ ] Collect product name, brand when available, category, price, package size and unit price.
- [ ] Add promotion text when available.
- [ ] Save the result as CSV or JSON.
- [ ] Include the shop name and snapshot date.
- [ ] Collect enough common products for shopping-list experiments.

**Definition of done:** A fixed Auchan snapshot contains the main fields and can be loaded by the project.

---

## Issue 3: Collect products from a second supermarket

**Labels:** `scraper`, `data`, `priority-high`

**Goal:** Create the minimum multi-shop dataset needed for a real price comparison.

**Relevance to the project proposal:** Section 3.1 names Cactus, Delhaize and Auchan as candidate Luxembourg supermarkets. The risk table says that two shops are sufficient for the core study if access to another shop is unavailable. Two compatible datasets are therefore enough for the university prototype.

**Tasks**

- [ ] Choose Cactus or Delhaize based on which source is easiest to use.
- [ ] Collect the same main fields as for Auchan.
- [ ] Focus on common categories such as milk, bread, cheese, pasta, fruit and household products.
- [ ] Save the data in the same CSV or JSON format.
- [ ] Create one fixed snapshot for the experiments.

**Definition of done:** The system can compare overlapping products from two supermarkets.

---

## Issue 4: Clean and combine the product data

**Labels:** `data`, `priority-high`

**Goal:** Produce one simple product file used by retrieval, matching and basket calculation.

**Relevance to the project proposal:** Table 2 identifies product name, price and unit price, category, promotion text and optional EAN as project attributes. Section 4.1 places these values in a shared product store used by FAISS, LLM processing and deterministic basket calculation.

**Tasks**

- [ ] Combine both supermarket datasets and add a `shop` column.
- [ ] Convert prices into numeric euro values.
- [ ] Standardise common units such as g, kg, ml, l and piece.
- [ ] Remove obvious duplicate rows.
- [ ] Keep the original product names and promotion text.
- [ ] Save the cleaned dataset as CSV or Parquet.

**Definition of done:** One cleaned file loads successfully and contains products from both supermarkets.

---

## Issue 7: Implement basket price calculation

**Labels:** `pricing`, `priority-high`

**Goal:** Calculate trustworthy basket totals using ordinary Python code.

**Relevance to the project proposal:** The proposal's guiding principle is that the LLM interprets language while deterministic Python computes every discount and total (Sections 4.1 and Figure 1). The final output must include the total per shop, cheapest shop and savings.

**Tasks**

- [ ] Calculate the required packages for each requested quantity.
- [ ] Apply the structured promotion rules.
- [ ] Calculate an item subtotal and one total per supermarket.
- [ ] Calculate the euro and percentage difference between shops.
- [ ] Return the cheapest supermarket.
- [ ] Check the result manually on three example baskets.

**Definition of done:** Three manually calculated baskets match the Python results.

---

## Issue 8: Run Mistral 7B Instruct in Google Colab

**Labels:** `llm`, `priority-high`

**Goal:** Verify that the selected open-source model can run with the group's available resources.

**Relevance to the project proposal:** Section 4.4 selects Mistral 7B Instruct, run locally in Google Colab. The proposal identifies 4-bit quantisation as the practical response to limited free Colab GPU resources and as part of objective 3, Advanced Technique.

**Tasks**

- [ ] Create a Google Colab notebook.
- [ ] Load Mistral 7B Instruct.
- [ ] Run the 4-bit model.
- [ ] Test several simple prompts.
- [ ] Write short loading and inference instructions.
- [ ] Record approximate GPU memory use.

**Definition of done:** A group member can open the notebook and obtain a model response.

---

## Issue 9: Interpret a shopping list with the LLM

**Labels:** `llm`, `priority-high`

**Goal:** Convert an informal multilingual list into structured items, quantities and units.

**Relevance to the project proposal:** Ambiguous shopping lists are the first problem in Section 2. Table 5 defines the structured output as item, quantity and unit, using "2 l milk, grated cheese" as the example input. The proposal compares Mistral list interpretation with keyword search.

**Tasks**

- [ ] Write a prompt that returns JSON.
- [ ] Extract item name, quantity and unit.
- [ ] Test comma-separated and line-separated lists.
- [ ] Test English and several French or German examples.
- [ ] Show a simple error message if the answer is not valid JSON.
- [ ] Save the chosen prompt.

**Definition of done:** At least five representative shopping lists produce usable structured items.

---

## Issue 10: Build the FAISS product search

**Labels:** `retrieval`, `llm`, `priority-high`

**Goal:** Retrieve a short candidate list instead of asking the LLM to search the whole catalogue.

**Relevance to the project proposal:** Section 4.3 states that product names are embedded with a sentence-transformer and indexed with FAISS. The index should return a small candidate set per shop, reducing inference cost and restricting the LLM to a well-defined decision.

**Tasks**

- [ ] Select a multilingual sentence-transformer.
- [ ] Create embeddings for product names.
- [ ] Build a FAISS index.
- [ ] Return the five closest products for a query.
- [ ] Include product ID, shop, name, package size and price.
- [ ] Try queries such as milk, grated cheese and sliced bread.

**Definition of done:** A query returns five relevant product candidates with their metadata.

---

## Issue 11: Match products using the LLM

**Labels:** `llm`, `retrieval`, `priority-high`

**Goal:** Ask the model to select the best matching product from the retrieved candidates.

**Relevance to the project proposal:** Product matching is the second language task in Table 5. The proposal expects the model to handle abbreviations and representations such as ½ versus demi and 1L versus 1 litre. Table 6 evaluates FAISS plus Mistral against string similarity using precision, recall and F1.

**Tasks**

- [ ] Provide the requested item and FAISS candidates to Mistral.
- [ ] Ask for a selected product ID.
- [ ] Allow "no suitable match".
- [ ] Try obvious matches and near-matches.
- [ ] Compare a small sample with the string-similarity baseline.
- [ ] Save examples where the two approaches disagree.

**Definition of done:** The model chooses only from the provided candidates or explicitly returns no match.

---

## Issue 12: Parse promotions using the LLM

**Labels:** `llm`, `pricing`

**Goal:** Convert free-text offers into structured rules for Python calculation.

**Relevance to the project proposal:** Promotion parsing is the fourth LLM task in Table 5. Inputs such as "-50% sur le 2e" should become a structured rule with type, threshold and discount. The proposal requires the arithmetic to remain outside the LLM.

**Tasks**

- [ ] Create a promotion-parsing prompt.
- [ ] Return JSON containing promotion type and values.
- [ ] Test about 20 examples during development.
- [ ] Pass the parsed rule to the basket calculator.
- [ ] Compare the sample results with the rule-based parser.

**Definition of done:** The supported sample promotions produce rules that Python can calculate.

---

## Issue 13: Suggest cheaper alternatives

**Labels:** `llm`, `retrieval`

**Goal:** Identify a cheaper candidate that remains a reasonable substitute.

**Relevance to the project proposal:** Cheaper-alternative selection is the third LLM task in Table 5 and part of the promised working prototype in Section 6. The preliminary data already shows the task's value: two 250 g organic unsalted butters cost €3.25 and €3.60.

**Tasks**

- [ ] Search candidates in the same category.
- [ ] Compare package size, unit price and product type.
- [ ] Ask the LLM whether the cheaper item is a reasonable alternative.
- [ ] Display the original product, alternative and price difference.
- [ ] Try the feature on about ten products.

**Definition of done:** The prototype can show several sensible lower-priced alternatives without claiming that every cheaper item is equivalent.

---

## Issue 14: Connect the complete pipeline

**Labels:** `integration`, `priority-high`

**Goal:** Make the full project work from an entered list to a shop comparison.

**Relevance to the project proposal:** Figure 1 specifies the complete chain: interpret list, retrieve and match, propose alternatives, parse promotions, compute basket, then answer with the cheapest shop and savings. Delivering this end-to-end technical implementation is objective 1 of the proposal.

**Tasks**

- [ ] Accept a free-text shopping list.
- [ ] Interpret items with Mistral.
- [ ] Retrieve products with FAISS.
- [ ] Select matching products.
- [ ] Parse relevant promotions.
- [ ] Calculate totals with Python.
- [ ] Display the cheapest shop, savings and unmatched items.

**Definition of done:** At least five prepared shopping lists run from input to final comparison.

---

## Issue 15: Create small evaluation datasets

**Labels:** `data`, `evaluation`

**Goal:** Prepare a manageable manually checked set for the report.

**Relevance to the project proposal:** Section 3.3 proposes approximately 100 promotions, 500 product pairs and 30 shopping lists. For a five-week university prototype, the promotion and list targets can remain similar while the product-pair set may be reduced if annotation becomes the bottleneck. Manual labels are necessary because the preliminary Auchan data exposes no EAN barcodes.

**Tasks**

- [ ] Collect 50–100 promotion examples.
- [ ] Label 100–200 product pairs as same or different.
- [ ] Prepare 15–30 shopping lists.
- [ ] Record expected outputs or manually calculated totals.
- [ ] Divide annotation among the three group members.
- [ ] Review uncertain examples together.

**Definition of done:** The group has a frozen, reviewed test set that is large enough to produce meaningful project results.

---

## Issue 16: Compare the LLM with the baselines

**Labels:** `evaluation`, `priority-high`

**Goal:** Produce the quantitative evidence required by the proposal.

**Relevance to the project proposal:** Objective 5 is Quantifiable Impact. Table 6 requires each LLM component to be compared with a classical baseline, and Section 6 proposes a headline result reporting average euro and percentage savings together with the proportion of correct totals.

**Tasks**

- [ ] Compare Mistral promotion parsing with the simple rule parser.
- [ ] Compare Mistral matching with string similarity.
- [ ] Calculate product-matching accuracy or precision, recall and F1.
- [ ] Calculate promotion-parsing accuracy.
- [ ] Measure the share of shopping-list items mapped correctly.
- [ ] Count correct basket totals.
- [ ] Calculate average savings in euros and percent.
- [ ] Place the main results in one table.

**Definition of done:** One results table can be copied directly into the final report and presentation.

---

## Issue 17: Compare 4-bit and 16-bit Mistral

**Labels:** `llm`, `evaluation`

**Goal:** Evaluate whether quantisation reduces memory while preserving useful accuracy.

**Relevance to the project proposal:** Section 4.4 defines 4-bit versus 16-bit quantisation as the project's advanced-technique comparison. Table 6 measures accuracy drop and GPU memory. The proposal's risk table also recognises that limited Colab resources may prevent all large experiments.

**Tasks**

- [ ] Use the same small representative sample for both versions.
- [ ] Run the 4-bit model.
- [ ] Run the 16-bit model if Colab resources permit.
- [ ] Compare task accuracy.
- [ ] Compare approximate GPU memory use.
- [ ] Record failures and write a short conclusion.

**Definition of done:** The report contains a fair small-sample comparison, or a documented resource limitation if 16-bit cannot run.

---

## Issue 18: Build a simple Streamlit interface

**Labels:** `ui`, `priority-high`

**Goal:** Provide a clear mock deployment for the final presentation.

**Relevance to the project proposal:** Section 4.5 accepts a mock deployment through a notebook or Streamlit. The user should type a shopping list and receive the cheapest shop, total per shop and proposed alternatives. A simple Streamlit page directly satisfies this requirement.

**Tasks**

- [ ] Add a text box for the shopping list.
- [ ] Add a Compare prices button.
- [ ] Display selected products and unmatched items.
- [ ] Display one total per supermarket.
- [ ] Highlight the cheapest supermarket and estimated savings.
- [ ] Display cheaper alternatives where available.

**Definition of done:** The prepared demo lists can be entered in Streamlit and produce readable results.

---

## Issue 19: Prepare the final demo and README

**Labels:** `documentation`, `priority-high`

**Goal:** Make the prototype understandable, rerunnable and presentation-ready.

**Relevance to the project proposal:** Section 6 expects a working prototype, reproducible GitHub repository and quantitative evaluation. The Week 5 work plan is explicitly "Evaluation and demo", including all metrics, a Streamlit or notebook demonstration and final report.

**Tasks**

- [ ] Add simple installation and run instructions.
- [ ] Explain how to start Streamlit or the notebook.
- [ ] Add one example shopping list.
- [ ] Add a short architecture description.
- [ ] Add the final evaluation table.
- [ ] Explain the main limitations.
- [ ] Prepare two or three reliable demonstration lists.
- [ ] Run through the presentation before submission.

**Definition of done:** Another person can follow the README, and the group has a stable presentation path.
