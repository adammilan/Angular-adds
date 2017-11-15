import { Component, OnInit } from '@angular/core';

import * as d3 from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3Shape from "d3-shape";

import { STATISTICS } from './data';
import { Stats } from './data';
import {Http} from "@angular/http";
import {DataService} from "../services/data.service";
import {ToastComponent} from "../shared/toast/toast.component";
import {FormBuilder, FormGroup, FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-statics',
  styleUrls: ['./statics.component.css'],
  templateUrl: './statics.component.html',
  providers:[DataService]
})
export class StaticsComponent implements OnInit {

  ads = [];
  isLoading = true;
  flag=true;

  ad = {};
  isEditing = false;

  addAdForm: FormGroup;
  messageName = new FormControl('', Validators.required);
  messageID = new FormControl('', Validators.required);
  messageText = new FormControl('', Validators.required);
  messagePics = new FormControl('', Validators.required);
  messageTemplatePath = new FormControl('', Validators.required);
  messageNumOfSeconds = new FormControl('', Validators.required);
  startDateWithTime = new FormControl('', Validators.required);
  endDateWithTime = new FormControl('', Validators.required);
  numOfdaysToShow = new FormControl('', Validators.required);



  title = 'Our Graph';
  subtitle = 'Bar Chart';

  private width: number;
  private height: number;
  private margin = {top: 20, right: 20, bottom: 30, left: 40};

  private widthPie: number;
  private heightPie: number;
  private radius: number;
  private arc: any;
  private labelArc: any;
  private pie: any;
  private color: any;
  private svgPie: any;


  private x: any;
  private y: any;
  private svg: any;
  private g: any;
  public dataToGraphA = [];
  public dataToGraphB = [];

  setDataToGraphs(){
    console.log(this.ads)
    var i=0;

    if (this.flag == true){
      for(i; i<this.ads.length;i++){
          this.dataToGraphA.push({letter: this.ads[i].messageTemplatePath.toString(), frequency: 0.002222})
          this.dataToGraphB.push({age: this.ads[i].messageTemplatePath.toString(), population: this.ads[i].messageNumOfSeconds.toString()})
      }
      console.log(this.dataToGraphA)
      console.log(STATISTICS)
    }
    this.flag=false;
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawBars();
    this.drawPie();

  }

  constructor(private http: Http,
              private dataService: DataService,
              public toast: ToastComponent,
              private formBuilder: FormBuilder){
    this.widthPie = 960 - this.margin.left - this.margin.right;
    this.heightPie = 500 - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.widthPie, this.heightPie) / 2;
  }


  ngOnInit(){
    this.getAds();

    this.addAdForm = this.formBuilder.group({
      messageName: this.messageName,
      messageID: this.messageID,
      messageText: this.messageText,
      messagePics: this.messagePics,
      messageTemplatePath: this.messageTemplatePath,
      messageNumOfSeconds: this.messageNumOfSeconds,
      startDateWithTime: this.startDateWithTime,
      endDateWithTime: this.endDateWithTime,
      numOfdaysToShow: this.numOfdaysToShow
    });

  }
  getAds() {
    this.dataService.getAds().subscribe(
      data => this.ads = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }


  private initAxis() {
      this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.dataToGraphA.map((d) => d.letter));
    this.y.domain([0, d3Array.max(STATISTICS, (d) => d.frequency)]);
  }
  private drawAxis() {
    this.g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3Axis.axisBottom(this.x));
    this.g.append("g")
      .attr("class", "axis axis--y")
      .call(d3Axis.axisLeft(this.y).ticks(10, "%"))
      .append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");
  }
  private drawBars() {
    this.g.selectAll(".bar")
      .data(this.dataToGraphA)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d) => this.x(d.letter) )
      .attr("y", (d) => this.y(d.frequency) )
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => this.height - this.y(d.frequency) );

  }
  private initSvg() {

    this.svg = d3.select(".graph");
    this.width = 960 - this.margin.left - this.margin.right ;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.g = this.svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.color = d3Scale.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    this.arc = d3Shape.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);
    this.labelArc = d3Shape.arc()
      .outerRadius(this.radius - 40)
      .innerRadius(this.radius - 40);
    this.pie = d3Shape.pie()
      .sort(null)
      .value((d: any) => d.population);
    this.svgPie = d3.select(".pie")
      .append("g")
      .attr("transform", "translate(" + this.widthPie / 2 + "," + this.heightPie / 2 + ")");
  }
  private drawPie() {
    let g = this.svgPie.selectAll(".arc")
      .data(this.pie(this.dataToGraphB))
      .enter().append("g")
      .attr("class", "arc");
    g.append("path").attr("d", this.arc)
      .style("fill", (d: any) => this.color(d.data.age) );
    g.append("text").attr("transform", (d: any) => "translate(" + this.labelArc.centroid(d) + ")")
      .attr("dy", ".35em")
      .text((d: any) => d.data.age);
  }



}

