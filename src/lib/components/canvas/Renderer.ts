import { MM_TO_PX, PX_TO_MM as PX_TO_MM } from '$lib/constants'
import { canvasSVG, sideBarKey, sideBarOpen } from '$lib/store'
import type { ColorObj, ObjectType, Shape } from '$lib/types'
import { getDistance, rgbaChecker } from '$lib/utils'
import { fabric } from 'fabric'
import { writable } from 'svelte/store'

export const colorStore = writable<ColorObj | null>(null)
export const shape = writable<Shape | null>(null)

export class Renderer {
	getRectObj = () =>
		new fabric.Rect({
			fill: 'rgba(236, 239, 244, 0.8)',
			stroke: 'rgba(76, 86, 106, 1)',

			strokeWidth: 1,
			width: 300 * MM_TO_PX,
			height: 120 * MM_TO_PX,
			rx: 10,
			ry: 10,
			cornerStyle: 'circle',
			originX: 'center',
			originY: 'center',
		})
	getTextBoxObj = (text: string = 'hello world') =>
		new fabric.Textbox(text, {
			fill: 'rgba(76, 86, 106, 1)',
			stroke: 'rgba(76, 86, 106, 1)',
			fontSize: 50 * MM_TO_PX,
			strokeWidth: 0,
			fontFamily: 'Nanum Pen Script',
			cornerStyle: 'circle',
			originX: 'center',
			originY: 'center',
			textAlign: 'center',
		})
	getITextObj = (text: string = 'hello world') =>
		new fabric.IText(text, {
			fill: 'rgba(76, 86, 106, 1)',
			stroke: 'rgba(76, 86, 106, 1)',
			fontSize: 30,
			strokeWidth: 1,
			fontFamily: 'Nanum Pen Script',
			cornerStyle: 'circle',
			originX: 'center',
			originY: 'center',
			textAlign: 'center',
		})
	getCircleObj = () =>
		new fabric.Circle({
			fill: 'rgba(236, 239, 244, 0.8)',
			stroke: 'rgba(76, 86, 106, 1)',

			strokeWidth: 1,
			radius: 100,
			cornerStyle: 'circle',
			originX: 'center',
			originY: 'center',
		})

	constructor(private canvas: fabric.Canvas) {}

	onSideBarOpen() {
		sideBarOpen.set(true)
	}
	onSidebarClose() {
		sideBarOpen.set(false)
	}
	changeSideBar() {
		sideBarKey.set(Symbol())
	}
	onObjectSelect(e?: fabric.IEvent) {
		console.log('selected')
		const activeObject = this.canvas.getActiveObject()
		if (activeObject) {
			shape.set({
				fill: rgbaChecker(activeObject.fill) as string,
				stroke: rgbaChecker(activeObject.stroke) as string,
				objectType: activeObject.type as ObjectType,
				strokeWidth: activeObject.strokeWidth as number,
			})
			this.onSideBarOpen()
		}
	}
	onObjectSelectUpdate(e: fabric.IEvent) {
		console.log('updated')
		this.onObjectSelect()
		this.changeSideBar()
	}
	onObjectSelectClear() {
		console.log('cleared')
		this.canvas.discardActiveObject().renderAll()
		this.onSidebarClose()
		this.setClearShape()
	}

	setClearShape() {
		shape.set(null)
	}

	onMakeGroup(objects: fabric.Object[]) {
		const group = new fabric.Group(objects, {
			fill: 'rgba(236, 239, 244, 0.9)',
			stroke: 'rgba(76, 86, 106, 1)',
			originX: 'center',
			originY: 'center',
			strokeWidth: 0,
			subTargetCheck: true,
		})
		return group
	}

	onMakeObject(type: ObjectType) {
		switch (type) {
			case 'rect':
				const rect = this.getRectObj()
				const rectText = this.getTextBoxObj()
				this.canvas.centerObject(rect)
				rectText.set({
					left: rect.left!,
					top: rect.top!,
					width: rect.width!,
					splitByGrapheme: true,
				})
				const rectGroup = this.onMakeGroup([rect, rectText])
				rectGroup.on('mousedblclick', (e) => {
					const tempText = this.getTextBoxObj(rectText.text!)
					tempText.set({
						left: e.target!.left,
						top: e.target!.top,
						width: rect.width!,
						splitByGrapheme: true,
					})
					rectText.visible = false
					rectGroup.addWithUpdate()
					tempText.visible = true
					tempText.selectable = false
					this.canvas.add(tempText)
					this.canvas.setActiveObject(tempText)
					tempText.enterEditing()
					tempText.selectAll()
					tempText.on('editing:exited', () => {
						const newText = tempText.text
						rectText.text = newText
						rectText.visible = true
						tempText.visible = false
						rectGroup.addWithUpdate()
						this.canvas.remove(tempText)
						this.canvas.setActiveObject(rectGroup)
					})
				})
				this.canvas.add(rectGroup)

				break
			case 'circle':
				const circle = this.getCircleObj()
				const circleText = this.getTextBoxObj()
				this.canvas.centerObject(circle)
				circleText.set({
					left: circle.left!,
					top: circle.top!,
					width: circle.radius! * 2,
				})
				const circleGroup = this.onMakeGroup([circle, circleText])
				circleGroup.on('mousedblclick', (e) => {
					const tempText = this.getTextBoxObj(circleText.text!)
					tempText.set({
						left: e.target!.left,
						top: e.target!.top,
						width: circle.width!,
						splitByGrapheme: true,
					})

					circleText.visible = false
					circleGroup.addWithUpdate()
					tempText.visible = true
					tempText.selectable = false
					this.canvas.add(tempText)
					this.canvas.setActiveObject(tempText)
					tempText.enterEditing()
					tempText.selectAll()
					tempText.on('editing:exited', () => {
						const newText = tempText.text
						circleText.text = newText
						circleText.visible = true
						tempText.visible = false
						circleGroup.addWithUpdate()
						this.canvas.remove(tempText)
						this.canvas.setActiveObject(circleGroup)
					})
				})
				this.canvas.add(circleGroup)

				break
			case 'text':
				const textObj = this.getITextObj()
				this.canvas.discardActiveObject()
				this.canvas.centerObject(textObj)
				this.canvas.add(textObj)
				this.canvas.setActiveObject(textObj)
				textObj.enterEditing()
				textObj.setSelectionStart(0)
				textObj.setSelectionEnd(textObj.text!.length)
				break
			default:
				break
		}
	}

	onUpdateObject(shape: Shape) {
		const activeObject = this.canvas.getActiveObject()

		if (activeObject && shape) {
			if (activeObject.type === 'group') {
				const group = activeObject as fabric.Group
				group.forEachObject((obj) => {
					if (obj.type === 'rect' || obj.type === 'circle') {
						shape.fill && obj.set('fill', shape.fill as string)
						shape.stroke && obj.set('stroke', shape.stroke as string)
					}
					if (obj.type === 'textbox') {
						shape.stroke && obj.set('stroke', shape.stroke as string)
						shape.strokeWidth && obj.set('strokeWidth', shape.strokeWidth as number)
					}
				})
			}
			shape.fill && activeObject.set('fill', shape.fill as string)
			shape.stroke && activeObject.set('stroke', shape.stroke as string)
			shape.strokeWidth && activeObject.set('strokeWidth', shape.strokeWidth as number)
			this.canvas.requestRenderAll()
		}
	}

	onAddImage(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (e) => {
			if (!e?.target?.result || typeof e.target.result !== 'string') return
			const image = new Image()
			image.src = e.target.result
			image.onload = () => {
				const img = new fabric.Image(image)
				img.scaleToWidth(300)
				this.canvas.add(img)
				this.canvas.setActiveObject(img)
				this.canvas.centerObject(img)
				this.canvas.renderAll()
			}
		}
		reader.readAsDataURL(file)
	}

	onAddStickyLine() {
		let isDrawing = false
		let stickyLine: fabric.Line | null = null

		this.canvas.on('mouse:down', (e) => {
			isDrawing = true
			const pointer = this.canvas.getPointer(e.e)
			stickyLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {})
			if (stickyLine) {
				this.canvas.add(stickyLine)
			}
		})
		this.canvas.on('mouse:move', (e) => {
			if (!isDrawing) return
			const pointer = this.canvas.getPointer(e.e)
			const point = new fabric.Point(pointer.x, pointer.y)
			stickyLine &&
				stickyLine.set({
					x2: pointer.x,
					y2: pointer.y,
					stroke: 'rgba(0,0,0,1)',
					strokeWidth: 3,
					strokeLineCap: 'round',
					originX: 'center',
					originY: 'center',
					selectable: true,
				})

			let closestObject: fabric.Object | null = null
			let closestDistance = Infinity

			this.canvas.forEachObject((object) => {
				if (object.containsPoint(point)) {
					const distance = getDistance(point, object.getCenterPoint())
					if (distance < closestDistance) {
						closestObject = object
						closestDistance = distance
					}
				}
			})
			if (closestObject) {
				const object = closestObject as fabric.Object
				if (closestDistance <= Math.sqrt(object!.width! ** 2 + object!.height! ** 2) + 30) {
					const bound = object.getBoundingRect()
					const tl = new fabric.Point(bound.left, bound.top)
					const tr = new fabric.Point(bound.left + bound.width, bound.top)
					const bl = new fabric.Point(bound.left, bound.top + bound.height)
					const br = new fabric.Point(bound.left + bound.width, bound.top + bound.height)
					const center = new fabric.Point(
						bound.left + bound.width / 2,
						bound.top + bound.height / 2,
					)
					const tc = new fabric.Point(bound.left + bound.width / 2, bound.top)
					const bc = new fabric.Point(bound.left + bound.width / 2, bound.top + bound.height)
					const lc = new fabric.Point(bound.left, bound.top + bound.height / 2)
					const rc = new fabric.Point(bound.left + bound.width, bound.top + bound.height / 2)

					const closestPoint = [tc, bc, lc, rc, center].reduce((prev, curr) =>
						getDistance(prev, point) > getDistance(curr, point) ? curr : prev,
					)
					const diffX = point.x - closestPoint.x
					const diffY = point.y - closestPoint.y
					if (Math.abs(diffX) > Math.abs(diffY)) {
						stickyLine?.set({ x2: closestPoint.x, y2: point.y })
					} else {
						stickyLine?.set({ x2: point.x, y2: closestPoint.y })
					}
				}
			}
			this.canvas.renderAll()
		})

		this.canvas.on('mouse:up', (e) => {
			stickyLine?.setCoords()
			// cancel line mode
			isDrawing = false
			this.canvas.off('mouse:down')
			this.canvas.off('mouse:move')
			this.canvas.off('mouse:up')
		})
	}

	// TODO : Simplify
	// onAddSignBoard() {
	// 	let dataURL: string = ''
	// 	fabric.Image.fromURL('/bg_stainless.jpg', (img) => {
	// 		fabric.loadSVGFromURL('/cloud.svg', (objects, options) => {
	// 			const signText = new fabric.Textbox('팟플레이스', {
	// 				fill: 'rgba(255, 255, 255, 1)',
	// 				stroke: 'rgba(255, 255, 255, 1)',
	// 				fontSize: 70 * MM_TO_PX,
	// 				strokeWidth: 0,
	// 				fontFamily: 'Nanum Pen Script',
	// 				cornerStyle: 'circle',
	// 				originX: 'center',
	// 				textAlign: 'center',
	// 				left: img.left!,
	// 				top: img.top! + 50 * MM_TO_PX,
	// 			})
	// 			const cloud = objects[0]
	// 			cloud.set({
	// 				originX: 'center',
	// 				originY: 'center',
	// 				left: img.left!,
	// 				top: img.top! - 30 * MM_TO_PX,
	// 				stroke: 'rgba(255, 255, 255, 1)',
	// 			})
	// 			cloud.scaleToWidth(100 * MM_TO_PX)
	// 			cloud.scaleToHeight(100 * MM_TO_PX)
	// 			img.set({
	// 				width: 400 * MM_TO_PX,
	// 				height: 300 * MM_TO_PX,
	// 				cornerStyle: 'circle',
	// 				originX: 'center',
	// 				originY: 'center',
	// 			})

	// 			const group = new fabric.Group([img, cloud, signText], {
	// 				originX: 'center',
	// 				originY: 'center',
	// 			})

	// 			const _canvas = new fabric.Canvas(null, {
	// 				width: group.width,
	// 				height: group.height,
	// 				backgroundColor: 'rgba(255,255,255,0)',
	// 			})
	// 			_canvas.centerObject(group)
	// 			_canvas.add(group)
	// 			dataURL = _canvas.toDataURL({
	// 				format: 'png',
	// 				quality: 1,
	// 			})
	// 			canvasSVG.set(dataURL)

	// 			this.canvas.centerObject(group)
	// 			this.canvas.add(group)
	// 			this.canvas.renderAll()

	// 			// signGroup.on('mousedblclick', (e) => {
	// 			// 	signGroup.toActiveSelection()
	// 			// 	this.canvas.setActiveObject(signText)
	// 			// 	signText.enterEditing()
	// 			// 	signText.selectAll()

	// 			// const tempText = new fabric.Textbox(signText.text || 'Company', {
	// 			// 	fill: 'rgba(255, 255, 255, 1)',
	// 			// 	stroke: 'rgba(255, 255, 255, 1)',
	// 			// 	fontSize: 70 * MM_TO_PX,
	// 			// 	strokeWidth: 0,
	// 			// 	fontFamily: 'Nanum Pen Script',
	// 			// 	cornerStyle: 'circle',
	// 			// 	originX: 'center',
	// 			// 	textAlign: 'center',
	// 			// 	left: img.left!,
	// 			// 	top: img.top! + 50 * MM_TO_PX,
	// 			// })
	// 			// tempText.set({
	// 			// 	left: e.target!.left,
	// 			// 	top: e.target!.top! + 50 * MM_TO_PX,
	// 			// 	width: img.width!,
	// 			// 	splitByGrapheme: true,
	// 			// })
	// 			// signText.visible = false
	// 			// signGroup.addWithUpdate()
	// 			// tempText.visible = true
	// 			// tempText.selectable = false
	// 			// this.canvas.add(tempText)
	// 			// this.canvas.setActiveObject(tempText)
	// 			// tempText.enterEditing()
	// 			// tempText.selectAll()

	// 			// tempText.on('editing:exited', () => {
	// 			// 	const newText = tempText.text
	// 			// 	signText.text = newText
	// 			// 	signText.visible = true
	// 			// 	tempText.visible = false
	// 			// 	signGroup.addWithUpdate()
	// 			// 	this.canvas.remove(tempText)
	// 			// 	this.canvas.setActiveObject(signGroup)
	// 			// })
	// 			// })
	// 		})
	// 	})
	// 	return dataURL
	// }
}
