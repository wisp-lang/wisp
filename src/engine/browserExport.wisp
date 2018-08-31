(ns wisp.engine.browser-export
  (:require [wisp.engine.browser :as browser]
            [wisp.runtime :as runtime]
            [wisp.sequence :as sequence]
            [wisp.reader :as reader]
            [wisp.compiler :as compiler]
            [wisp.string :as string]
            [wisp.expander :as expander]
            [wisp.analyzer :as analyzer]
            [wisp.backend.javascript.writer :as writer]
            [wisp.ast :as ast]
            ))

(set! module.exports {
                      :engine {:browser browser}
                      :runtime runtime
                      :sequence sequence
                      :reader reader
                      :compiler compiler
                      :string string
                      :expander expander
                      :analyzer analyzer
                      :backend {:javascript {:writer writer}}
                      :ast ast
                      })
