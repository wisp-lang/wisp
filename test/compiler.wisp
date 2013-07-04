(ns wisp.test.compiler
  (:require [wisp.src.ast :refer [symbol]]
            [wisp.src.sequence :refer [list]]
            [wisp.src.runtime :refer [str =]]
            [wisp.src.compiler :refer [self-evaluating? compile macroexpand
                                       compile-program]]
            [wisp.src.reader :refer [read-from-string]]))
